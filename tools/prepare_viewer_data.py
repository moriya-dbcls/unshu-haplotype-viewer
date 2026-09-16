#!/usr/bin/env python3
"""Convert chromosome-wise `odgi bin` TSV files into Citrus PathWeaver JSON.

The converter intentionally uses ODGI's summarized bins rather than sending a
large GFA/OG graph to the browser.  Configuration paths are resolved relative
to the configuration file.
"""

from __future__ import annotations

import argparse
import csv
import fnmatch
import json
from collections import defaultdict
from itertools import chain
from pathlib import Path
from typing import Any, Iterable


ODGI_FIELDS = (
    "path.name", "path.prefix", "path.suffix", "bin", "mean.cov",
    "mean.inv", "mean.pos", "first.nucl", "last.nucl",
)


def read_rows(path: Path) -> Iterable[dict[str, str]]:
    with path.open(newline="") as handle:
        lines = (line for line in handle if line.strip() and not line.startswith("##"))
        first = next(lines, None)
        if first is None:
            return
        values = first.rstrip("\n").split("\t")
        normalized = [value.lstrip("#") for value in values]
        if "path.name" in normalized and "bin" in normalized:
            reader = csv.DictReader(lines, delimiter="\t", fieldnames=normalized)
        else:
            reader = csv.DictReader(chain([first], lines), delimiter="\t", fieldnames=ODGI_FIELDS)
        yield from reader


def resolve_path(raw_name: str, raw_prefix: str, paths: list[dict[str, Any]]) -> str | None:
    for path in paths:
        patterns = [path["id"], *path.get("aliases", [])]
        if any(fnmatch.fnmatchcase(raw_name, pattern) or fnmatch.fnmatchcase(raw_prefix, pattern) for pattern in patterns):
            return path["id"]
    return None


def load_optional_tsv(path: Path | None) -> list[dict[str, str]]:
    if path is None or not path.exists():
        return []
    with path.open(newline="") as handle:
        return list(csv.DictReader((line for line in handle if line.strip() and not line.startswith("#")), delimiter="\t"))


def parse_support(value: str, fallback: list[str]) -> list[str]:
    result = [part.strip() for part in value.replace(";", ",").split(",") if part.strip()]
    return result or fallback


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True, type=Path, help="Viewer configuration JSON")
    parser.add_argument("--output", required=True, type=Path, help="Output citrus-pathweaver/v1 JSON")
    args = parser.parse_args()

    config_path = args.config.resolve()
    config = json.loads(config_path.read_text())
    base = config_path.parent
    paths = config["paths"]
    bin_width = int(config.get("bin_width", 100_000))
    fallback_paths = [path["id"] for path in paths]

    variants_path = base / config["variants"] if config.get("variants") else None
    switches_path = base / config["switches"] if config.get("switches") else None
    variants = load_optional_tsv(variants_path)
    switches = load_optional_tsv(switches_path)

    chromosomes: list[dict[str, Any]] = []
    for chrom_config in config["chromosomes"]:
        chrom_id = chrom_config["id"]
        source = (base / chrom_config["odgi_bin"]).resolve()
        tracks: dict[str, list[dict[str, Any]]] = defaultdict(list)
        max_bin = -1
        ignored_names: set[str] = set()

        for row in read_rows(source):
            raw_name = row.get("path.name", "")
            path_id = resolve_path(raw_name, row.get("path.prefix", ""), paths)
            if path_id is None:
                ignored_names.add(raw_name)
                continue
            bin_index = int(float(row["bin"]))
            max_bin = max(max_bin, bin_index)
            tracks[path_id].append({
                "start": bin_index * bin_width,
                "end": (bin_index + 1) * bin_width,
                "coverage": round(float(row.get("mean.cov") or 0), 5),
                "inversion": round(float(row.get("mean.inv") or 0), 5),
                "meanPosition": round(float(row.get("mean.pos") or 0), 1),
            })

        if max_bin < 0:
            raise ValueError(f"No configured paths were found in {source}")
        length = int(chrom_config.get("length", (max_bin + 1) * bin_width))

        chrom_variants = []
        for index, row in enumerate(v for v in variants if v.get("chromosome") == chrom_id):
            chrom_variants.append({
                "id": row.get("id") or f"{chrom_id}-event-{index + 1}",
                "start": int(float(row["start"])),
                "end": int(float(row["end"])),
                "type": (row.get("type") or "BUBBLE").upper(),
                "label": row.get("label") or row.get("type") or "graph event",
                "support": parse_support(row.get("support", ""), fallback_paths),
                "confidence": int(float(row.get("confidence") or 0)),
            })

        switch_sets: dict[str, list[float]] = {"CUNphKi": [], "CUNphKu": []}
        for row in (s for s in switches if s.get("chromosome") == chrom_id):
            path_id = row.get("path", "")
            if path_id in switch_sets:
                switch_sets[path_id].append(float(row["position"]) / length)

        chromosomes.append({
            "id": chrom_id,
            "length": length,
            "switchesKi": sorted(switch_sets["CUNphKi"]),
            "switchesKu": sorted(switch_sets["CUNphKu"]),
            "variants": chrom_variants,
            "tracks": dict(tracks),
            "source": {"odgiBin": str(source.name), "ignoredPathNames": sorted(ignored_names)},
        })

    output = {
        "schema": "citrus-pathweaver/v1",
        "title": config.get("title", "Minigraph-Cactus pangenome"),
        "coordinateSystem": "odgi-bin",
        "binWidth": bin_width,
        "paths": [{key: value for key, value in path.items() if key != "aliases"} for path in paths],
        "chromosomes": chromosomes,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")))
    print(f"wrote {args.output} ({args.output.stat().st_size / 1024:.1f} KiB)")


if __name__ == "__main__":
    main()
