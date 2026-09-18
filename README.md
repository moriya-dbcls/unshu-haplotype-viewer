# Unshu Haplotype Viewer

[日本語版 README](README.ja.md)

A lightweight pangenome chromosome viewer for comparing six haplotypes from three citrus cultivars: Satsuma mandarin (Unshu) and its parental lineages, Kishu mandarin and Kunenbo mandarin.

The viewer projects PGGB GFA data onto reference chromosome coordinates and displays haplotype paths, shared nodes, local similarity to the parental lineages, candidate structural variants, and candidate trait-associated genes.

## Viewer

https://moriya-dbcls.github.io/unshu-haplotype-viewer/

## Data source and development

The haplotype-resolved assemblies used in this project were obtained from the [Mikan Genome Database (MiGD2)](https://mikan.dna.naro.go.jp/migd2/data_download/download.html).

This viewer was developed during the [DBCLS BioHackathon 2026](https://2026.biohackathon.org/).

## Repository contents

- `dist/`: Static viewer and Chr1–9 display data published through GitHub Pages
- `tools/`: Scripts for generating and merging lightweight viewer JSON files from GFA data
- `viewer_config.example.json`: Example mapping between GFA path names and viewer labels

## Local preview

```bash
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/` in a browser.

## Notes

Shared-node similarity does not directly measure nucleotide sequence identity, identity by descent, or parent–offspring relationships. See **Help** in the upper-right corner of the viewer for calculation details and interpretation notes.
