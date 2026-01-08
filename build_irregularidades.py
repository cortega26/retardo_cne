#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script: build_irregularidades.py
Autor: (tu nombre)
Descripción:
    Lee y desagrega 1+ archivos .docx con contenido sobre irregularidades
    electorales (Venezuela 2024), extrae secciones clave y URLs como evidencia,
    y actualiza/crea:
        - docs/irregularidades.md  (tarjetas: Afirmación → Norma → Evidencia → Impacto → Réplica)
        - data/sources.csv         (matriz de evidencia machine-readable)

    No requiere API externa. Usa heurísticas deterministas (reglas) para
    separar secciones cuando el .docx no viene ya rotulado.

Uso:
    python build_irregularidades.py \
        --docx "content/Auditorías post-electorales no realizadas.docx" \
        --irr "docs/irregularidades.md" \
        --csv "data/sources.csv" \
        --create-if-missing

Requisitos:
    pip install python-docx pandas

Sugerencia:
    - Coloca tus .docx en ./content/ y ejecútalo sin argumentos; el script
      encontrará y procesará todos los .docx.

Limitaciones:
    - Las heurísticas intentan mapear contenido libre a las 5 secciones. Si
      tu .docx ya trae rótulos (Afirmación/Norma/Evidencia/Impacto/Réplica),
      el resultado será más preciso.
"""

from __future__ import annotations
import argparse
import csv
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

try:
    import pandas as pd
except Exception as e:
    print("[ERROR] Debes instalar pandas: pip install pandas", file=sys.stderr)
    raise

try:
    from docx import Document  # python-docx
except Exception as e:
    print("[ERROR] Debes instalar python-docx: pip install python-docx", file=sys.stderr)
    raise

# ============================= Utilidades generales ============================= #

LABELS = {
    "afirmacion": ["afirmación", "afirmacion", "hecho", "hallazgo"],
    "norma": ["norma", "marco legal", "base legal", "lopre", "reglamento", "constitución", "constitucion"],
    "evidencia": ["evidencia", "fuente", "referencia", "cita", "enlace", "link"],
    "impacto": ["impacto", "consecuencia", "implicación", "implicacion", "efecto"],
    "replica": ["réplica", "replica", "contraargumento", "respuesta"],
}

URL_RE = re.compile(r"https?://[^\s)\]]+")
DATE_RE = re.compile(r"\b(20\d{2})[-/](\d{1,2})(?:[-/](\d{1,2}))?\b")
ART_RE = re.compile(r"\b(art\.?|artículo|articulo)\s*(\d+[A-Za-z]?)", re.IGNORECASE)
LEGAL_KW_RE = re.compile(r"\b(lopre|reglamento|constituci[oó]n|art\.|art[ií]culo)\b", re.IGNORECASE)
EVIDENCE_KW_RE = re.compile(r"\b(evidenc|fuente|informe|reporte|documento|gaceta|pdf|acta|copia)\b", re.IGNORECASE)
IMPACT_KW_RE = re.compile(r"\b(impact|consecu|implicaci[oó]n|efecto)\b", re.IGNORECASE)
REPLICA_KW_RE = re.compile(r"\b(r[eé]plica|contraargument|respuesta|sin embargo|autoridad|cne|tsj)\b", re.IGNORECASE)

# ============================= Lectura de DOCX ============================= #

def read_docx_blocks(path: Path) -> List[Tuple[str, str]]:
    """Devuelve una lista de bloques (tipo, texto).
    tipo ∈ {"heading", "paragraph"}. Conserva el orden del documento.
    """
    doc = Document(str(path))
    blocks: List[Tuple[str, str]] = []
    for p in doc.paragraphs:
        txt = p.text.strip()
        if not txt:
            continue
        style = (p.style.name or "").lower()
        if "heading" in style or "título" in style or "titulo" in style:
            blocks.append(("heading", txt))
        else:
            blocks.append(("paragraph", txt))
    return blocks

# ============================= Heurísticas de parsing ============================= #

def is_label_line(text: str, kind: str) -> bool:
    t = text.strip().lower()
    for lbl in LABELS[kind]:
        if t.startswith(lbl + ":") or t == lbl:
            return True
    return False


def detect_label(text: str) -> Tuple[Optional[str], str]:
    for kind in LABELS:
        if is_label_line(text, kind):
            content = text.split(":", 1)[1].strip() if ":" in text else ""
            return kind, content
    return None, ""

def split_by_labels(paragraphs: List[str]) -> Dict[str, List[str]]:
    """Divide por rótulos explícitos tipo 'Afirmación:' en el .docx.
    Devuelve dict con listas de párrafos por clave (afirmacion, norma, evidencia, impacto, replica).
    """
    buckets = {k: [] for k in LABELS.keys()}
    current: Optional[str] = None
    for para in paragraphs:
        kind, content = detect_label(para)
        if kind:
            current = kind
            if content:
                buckets[current].append(content)
            continue
        if current:
            buckets[current].append(para)
    return buckets


def select_affirmation(paragraphs: List[str]) -> List[str]:
    return paragraphs[:2]


def find_legal(paragraphs: List[str]) -> List[str]:
    return [p for p in paragraphs if LEGAL_KW_RE.search(p)]


def find_evidence(paragraphs: List[str]) -> List[str]:
    return [p for p in paragraphs if URL_RE.search(p) or EVIDENCE_KW_RE.search(p)]


def find_impact(paragraphs: List[str]) -> List[str]:
    impact = [p for p in paragraphs if IMPACT_KW_RE.search(p)]
    if impact:
        return impact
    if len(paragraphs) > 2:
        return [paragraphs[-1]]
    return []


def find_replica(paragraphs: List[str]) -> List[str]:
    return [p for p in paragraphs if REPLICA_KW_RE.search(p)][-2:]


def guess_sections(paragraphs: List[str]) -> Dict[str, List[str]]:
    """Si no hay rótulos, estima secciones por palabras clave y posición."""
    buckets = {k: [] for k in LABELS.keys()}
    if not paragraphs:
        return buckets

    buckets["afirmacion"] = select_affirmation(paragraphs)
    buckets["norma"] = find_legal(paragraphs)
    buckets["evidencia"] = find_evidence(paragraphs)
    buckets["impacto"] = find_impact(paragraphs)
    buckets["replica"] = find_replica(paragraphs)

    return buckets

# ============================= Extracción de metadatos ============================= #

def extract_urls(texts: List[str]) -> List[str]:
    urls: List[str] = []
    for t in texts:
        urls.extend(URL_RE.findall(t))
    # normaliza y deduplica preservando orden
    seen = set()
    out = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out

from urllib.parse import urlparse

def domain_of(url: str) -> str:
    try:
        netloc = urlparse(url).netloc
        return netloc.lower()
    except Exception:
        return ""

# ============================= Sources.csv (upsert) ============================= #

def ensure_csv_exists(path: Path):
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["id","claim","source_type","outlet_org","date","url","archived_url","notes"])


def load_sources_df(path: Path) -> pd.DataFrame:
    ensure_csv_exists(path)
    try:
        return pd.read_csv(path)
    except Exception:
        return pd.DataFrame(columns=["id","claim","source_type","outlet_org","date","url","archived_url","notes"])


def next_eid(df: pd.DataFrame, start: int = 200) -> int:
    max_id = start - 1
    if not df.empty and "id" in df.columns:
        for x in df["id"].astype(str).tolist():
            m = re.match(r"E-(\d+)", x.strip())
            if m:
                max_id = max(max_id, int(m.group(1)))
    return max_id + 1

# ============================= MD (irregularidades) ============================= #

def read_md(path: Path) -> str:
    if path.exists():
        return path.read_text(encoding="utf-8")
    # plantilla mínima si no existe
    return (
        "# Irregularidades documentadas (2024)\n\n"
        "Cada ítem sigue el esquema **Afirmación → Norma → Evidencia → Impacto → Réplica**.\n\n"
    )


def renumber_sections(md: str) -> str:
    """Normaliza numeración ## n) según el orden presente."""
    lines = md.splitlines()
    new_lines = []
    count = 0
    for line in lines:
        if line.startswith("## ") and ")" in line:
            count += 1
            # reemplaza el prefijo "## X) " por "## count) "
            line = re.sub(r"^##\s*\d+\)\s*", f"## {count}) ", line)
        new_lines.append(line)
    return "\n".join(new_lines)


def append_section(md: str, title: str, parts: Dict[str, List[str]], refs: List[str]) -> str:
    # compone el bloque de tarjeta
    def joinp(key: str, default: str = "") -> str:
        txt = "\n\n".join(parts.get(key, [])).strip()
        return txt if txt else default

    refs_str = ", ".join(f"[{r}]" for r in refs) if refs else "(sin referencias)"

    block = (
        f"\n\n## ) {title}\n\n"
        f"**Afirmación.** {joinp('afirmacion', '—')}  \n"
        f"**Norma.** {joinp('norma', '—')}  \n"
        f"**Evidencia.** Referencias: {refs_str}.  \n"
        f"**Impacto.** {joinp('impacto', '—')}  \n"
        f"**Réplica oficial y respuesta.** {joinp('replica', '—')}\n\n"
        f"**Fuentes (extracto):** {refs_str}.\n"
    )

    md_out = md.rstrip() + block + "\n"
    md_out = renumber_sections(md_out)
    return md_out

# ============================= Proceso principal ============================= #

def process_docx(path: Path) -> Tuple[str, Dict[str, List[str]], List[str]]:
    """Devuelve (titulo, partes, urls) para un .docx."""
    blocks = read_docx_blocks(path)
    paras = [t for kind, t in blocks if kind == "paragraph"]

    # intuye título: 1er heading o nombre de archivo sin extensión
    headings = [t for kind, t in blocks if kind == "heading"]
    if headings:
        title = headings[0]
    else:
        title = path.stem

    # 1) intenta split por rótulos
    parts = split_by_labels(paras)
    have_any = any(parts[k] for k in parts)
    if not have_any:
        parts = guess_sections(paras)

    # 2) URLs para referencias
    urls = extract_urls(paras)

    return title, parts, urls


def upsert_urls_into_csv(df: pd.DataFrame, urls: List[str], claim_hint: str) -> Tuple[pd.DataFrame, List[str]]:
    """Inserta nuevas filas para URLs aún no presentes. Devuelve (df, lista de IDs nuevos)."""
    existing_urls = set((df["url"].astype(str).str.strip() if "url" in df else []))
    next_id = next_eid(df, start=200)
    new_ids: List[str] = []

    for u in urls:
        if u in existing_urls:
            # reutiliza id existente si está
            row = df[df["url"].astype(str).str.strip() == u]
            if not row.empty and "id" in row.columns:
                new_ids.append(row.iloc[0]["id"])  # añade para referencia
            continue
        eid = f"E-{next_id:03d}"
        next_id += 1
        new_ids.append(eid)
        df.loc[len(df)] = {
            "id": eid,
            "claim": claim_hint[:160],
            "source_type": "(por clasificar)",
            "outlet_org": domain_of(u),
            "date": "",
            "url": u,
            "archived_url": "",
            "notes": "Auto-import desde DOCX",
        }
    return df, new_ids


def backup_file(path: Path):
    if not path.exists():
        return
    bdir = path.parent / ".backups"
    bdir.mkdir(parents=True, exist_ok=True)
    ts = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    bpath = bdir / f"{path.name}.{ts}.bak"
    bpath.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Desagrega DOCX y actualiza MD + CSV")
    ap.add_argument("--docx", nargs="*", help="Ruta(s) a .docx a procesar. Si se omite, busca en ./content/")
    ap.add_argument("--irr", default="docs/irregularidades.md", help="Ruta a irregularidades.md")
    ap.add_argument("--csv", default="data/sources.csv", help="Ruta a data/sources.csv")
    ap.add_argument("--create-if-missing", action="store_true", help="Crea docs/ y data/ si faltan")
    return ap.parse_args()


def resolve_paths(args: argparse.Namespace, repo_root: Path) -> Tuple[Path, Path]:
    irr_path = repo_root / args.irr
    csv_path = repo_root / args.csv
    if args.create_if_missing:
        irr_path.parent.mkdir(parents=True, exist_ok=True)
        csv_path.parent.mkdir(parents=True, exist_ok=True)
    return irr_path, csv_path


def discover_docx_paths(args: argparse.Namespace, repo_root: Path) -> List[Path]:
    if args.docx:
        docx_paths = [Path(p) for p in args.docx]
    else:
        docx_paths = []
        content_dir = repo_root / "content"
        if content_dir.exists():
            docx_paths = sorted(content_dir.glob("*.docx"))
        if not docx_paths:
            docx_paths = sorted(repo_root.glob("*.docx"))

    if not docx_paths:
        print("[ERROR] No se encontraron archivos .docx. Usa --docx o coloca en ./content/", file=sys.stderr)
        sys.exit(2)

    return docx_paths


def process_docx_paths(
    docx_paths: List[Path],
    md_text: str,
    df: pd.DataFrame,
) -> Tuple[str, pd.DataFrame, int, int]:
    added_sections = 0
    total_new_sources = 0

    for dpath in docx_paths:
        print(f"[INFO] Procesando: {dpath}")
        try:
            title, parts, urls = process_docx(dpath)
        except Exception as e:
            print(f"[WARN] No se pudo procesar {dpath}: {e}")
            continue

        claim_hint = (parts.get("afirmacion") or [title])[0]
        df, new_ids = upsert_urls_into_csv(df, urls, claim_hint=claim_hint)
        total_new_sources += sum(1 for x in new_ids if x.startswith("E-"))

        md_text = append_section(md_text, title, parts, new_ids)
        added_sections += 1

    return md_text, df, added_sections, total_new_sources


def main():
    args = parse_args()
    repo_root = Path.cwd()
    irr_path, csv_path = resolve_paths(args, repo_root)
    docx_paths = discover_docx_paths(args, repo_root)

    md_text = read_md(irr_path)
    df = load_sources_df(csv_path)

    md_text, df, added_sections, total_new_sources = process_docx_paths(
        docx_paths,
        md_text,
        df,
    )

    backup_file(irr_path)
    backup_file(csv_path)

    df.to_csv(csv_path, index=False, encoding="utf-8")
    irr_path.write_text(md_text, encoding="utf-8")

    print("\n[OK] Actualización completada.")
    print(f" - Secciones añadidas a {irr_path}: {added_sections}")
    print(f" - Nuevas fuentes agregadas a {csv_path}: {total_new_sources}")
    print("\nSiguiente paso: commit & push, y desplegar MkDocs si ya configuraste GitHub Pages.")


if __name__ == "__main__":
    main()
