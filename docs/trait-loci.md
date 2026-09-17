# `trait_loci.json` の作成経緯と扱い

`dist/data/trait_loci.json` は、GFAや遺伝子注釈から自動生成されたデータではありません。**2026年9月時点で、ChatGPTに文献と公開情報を調査させ、候補選定、説明文の草案作成、MiGD2遺伝子との対応付けを行って作成した手作業の候補リスト**です。

公式データセット、原著者によるキュレーション、網羅的な形質遺伝子カタログではありません。研究に利用する場合は、引用文献、遺伝子ID、座標、相同関係を必ず再確認してください。

## 収録内容

現在は22候補を収録しています。

| 形質 | 候補 |
|---|---|
| 甘味 | CitSWEET6、CitSUS5、CitSPS1、INVA homolog、CitZAT5 |
| 酸味 | CitPH4、CitPH1、CitPH5、Noemi / AN1、CitCS homolog、CcACO3 homolog |
| 苦味 | CitLGT、Cit1,2RhaT / dGlcT cluster |
| 香り | CsTPS1、CitMTSE1 |
| 色 | Ruby1 homolog、CCD4b1 homolog |
| 果実サイズ | CitKC1、GAI/DELLA homolog |
| 種なし | CsUBC24 |
| 多胚性 | CitRKD1 / CitRWP |
| 機能性成分 | CitOMT |

候補は、ユーザーが指定した味・香り・色・種なしなどの形質群を起点に、柑橘で機能、変異、発現または経路との関連が報告された遺伝子をChatGPTが検索して整理したものです。

## 座標の作り方

表示座標は、温州みかんアセンブリv2を使って作成したGFAの `CUN#1` パス上の座標です。ここでいうv2はGFA形式の版ではなく、温州みかんアセンブリの版です。このGFAの `CUN#1` は、9染色体すべてでMiGD2 `CUNphKu r2.0` と染色体長が一致します。2026年9月17日の更新では、各候補に記録済みの `CUNphKu` 遺伝子IDをMiGD2のprimary-transcript GFF3で検索し、そのmRNA区間へ座標を更新しました。

更新前のファイルは `dist/data/trait_loci.v1.json`、旧座標と新座標の対応表は `docs/trait-loci-v2-coordinate-map.tsv` に保存しています。GFF3の取得元は [MiGD2 Genome and gene annotation data](https://mikan.dna.naro.go.jp/migd2/data_download/download.html) です。使用した `CUNphKu_r2.0.primaryTranscript.gff3.gz` のSHA-256は `54d4d04a1cd67003415907ad5e270a4b8d78cc3dff5dce91d8663319541734e3` です。温州みかんアセンブリv2を使って作成したGFAのファイルサイズ、SHA-256、CUN#1長は `docs/v2-data-manifest.tsv` に記録しています。

各エントリには、可能な範囲で次を記録しています。

- `chromosome`, `start`, `end`：CUN#1上の候補遺伝子区間
- `window`：初期拡大時に表示する周辺領域の幅
- `genes`：CUNphKi／CUNphKu側のMiGD2遺伝子ID候補
- `evidence`：機能実証、機構実証、近縁群・経路からの候補などの区分
- `description`：ビューワ用の短い説明
- `literature`：実験材料、実験根拠、この3品種へ適用する際の限界、座標対応法
- `literature.sources`：原著論文または主要情報源へのリンク

遺伝子本体は点ではなく `start`–`end` の区間です。`window` は遺伝子区間そのものではなく、プロモーター候補、近傍SV、グラフ分岐を観察するための表示範囲です。

## 証拠区分の読み方

- `validated`：柑橘で遺伝子機能を検証した実験的な根拠がある
- `mechanism`：制御機構、原因SVなどについて実験的な根拠がある
- `related`：関連解析、発現、経路、近縁品種の相同遺伝子などから選んだ候補

この区分は論文の品質スコアではありません。また、別品種で機能が実証されていても、温州・紀州・九年母の形質差をその座位が説明するとは限りません。

## 重要な制限

- ChatGPTによる検索・要約・対応付けを含むため、取り違えや解釈誤りの可能性があります。
- `homolog` と付いた項目は、表示遺伝子そのものの機能が実証されたことを意味しません。
- 文献の遺伝子名と現在のデータベース注釈名が一致しない場合があります。
- MiGD2遺伝子IDは相同候補であり、1対1オルソログを保証しません。
- 座標は現在の温州みかんアセンブリv2を使ったGFAのCUN#1投影に依存します。別のGFA、参照パス、アセンブリ版では再マッピングが必要です。
- このJSONは静的に読み込まれます。GFAを更新しても自動では更新されません。

## 更新方法

1. `dist/data/trait_loci.json` の `loci` 配列へエントリを追加または修正する。
2. `id` はファイル内で一意にする。
3. 染色体、遺伝子区間、CUN遺伝子ID、原著リンクを再確認する。
4. 日本語と英語の説明を両方更新する。
5. JSON構文を検証する。

アセンブリ更新時は、記録済み遺伝子IDと新しいprimary-transcript GFF3を使って座標を更新できます。具体的なコマンドは `docs/tools.md` に記載しています。

```bash
python3 -m json.tool dist/data/trait_loci.json >/dev/null
```

その後、ローカルでビューワを開き、候補名のクリック、染色体全体表示、遺伝子周辺への拡大、右欄の文献説明とリンクを確認してください。

## 再現性を高めるために今後残すべき情報

新しい候補を追加するときは、可能であれば次も記録してください。

- 検索日と検索語
- 参照した論文のDOI／PubMed ID
- 使用した遺伝子配列のアクセッション
- 使用したMiGD2アセンブリ・注釈版
- マッピングコマンドとアラインメント結果
- 採用した遺伝子モデルと棄却した候補
- 座標変換または手修正の理由

これらを残すことで、ChatGPTによる探索結果を、人が追跡・検証できるデータへ近づけられます。
