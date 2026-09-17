# 変換ツールの使い方

このリポジトリの `tools/` は、大きなGFAやODGIデータを、ブラウザで扱いやすい `citrus-pathweaver/v1` JSONへ変換するためのスクリプトです。現在の公開データは、染色体ごとのGFAを `gfa_to_viewer.py` で変換し、`merge_viewer_json.py` でChr1–9を結合したものです。

## 必要環境

- Python 3.10以上
- 標準ライブラリのみ（追加パッケージ不要）
- `gfa_to_viewer.py` を使う場合は、`S` レコードと `P` レコードを含むGFA

コマンドはリポジトリのルートで実行してください。

## GFAから1染色体分を作る

```bash
python3 tools/gfa_to_viewer.py /path/to/ch1.gfa \
  --output outputs/ch1.viewer.json \
  --reference 'CUN#1' \
  --bin-width 50000
```

引数：

- 第1引数：入力GFA
- `--output`：出力JSON（必須）
- `--reference`：座標軸に使うパスの接頭辞。既定値は `CUN#1`
- `--bin-width`：集約幅（bp）。既定値は5,000 bp。公開版は50,000 bpを使用

このスクリプトは、次の6パスを想定しています。

| GFA内のパス接頭辞 | ビューワでの表示 |
|---|---|
| `CKI#1` | 紀州 hap1 |
| `CKI#2` | 紀州 hap2 |
| `CUN#1` | 温州 hap（親系統は共有ノードから暫定判定） |
| `CUN#2` | 温州 hap（親系統は共有ノードから暫定判定） |
| `CKU#1` | 九年母 hap1 |
| `CKU#2` | 九年母 hap2 |

GFAの `P` レコードは、ノード名の後ろに `+` または `-` が付いたカンマ区切りのwalkを想定しています。パス名に `#ch1:開始-終了` のような区間があれば、その座標を表示範囲に利用します。

温州2パスの紀州由来／九年母由来の割り当ては、染色体全体の共有ノード長で重み付けしたJaccard係数から1対1になるよう暫定的に決めます。確定した系譜情報ではありません。

## 複数染色体を結合する

染色体ごとのJSONを作成後、次のように結合します。

```bash
python3 tools/merge_viewer_json.py \
  outputs/ch1.viewer.json \
  outputs/ch2.viewer.json \
  outputs/ch3.viewer.json \
  outputs/ch4.viewer.json \
  outputs/ch5.viewer.json \
  outputs/ch6.viewer.json \
  outputs/ch7.viewer.json \
  outputs/ch8.viewer.json \
  outputs/ch9.viewer.json \
  --output dist/data/citrus_ch1-ch9.viewer.json \
  --title '温州・紀州・九年母 3品種6ハプロタイプ'
```

入力JSONの `schema` とパス集合が一致しない場合はエラーになります。染色体は `Chr1`、`Chr2` … の数字順に並べられます。

## ODGI bin TSVから作る（代替経路）

`prepare_viewer_data.py` は、染色体ごとの `odgi bin` TSVを結合するための別経路です。

```bash
cp viewer_config.example.json viewer_config.json
# viewer_config.json 内のTSVパスとパス名対応を編集
python3 tools/prepare_viewer_data.py \
  --config viewer_config.json \
  --output dist/data/citrus_ch1-ch9.viewer.json
```

設定ファイルからの相対パスは、設定ファイル自身があるディレクトリを基準に解決されます。

### ODGI TSV

ヘッダー付きTSVでは、少なくとも次の列を使います。

```text
path.name  path.prefix  bin  mean.cov  mean.inv  mean.pos
```

ヘッダーがない場合は、スクリプト内の `ODGI_FIELDS` の順序として読み込みます。パス名は、設定ファイルの `id` または `aliases`（glob形式）に照合されます。

### 任意のイベントTSV

`variants` を指定する場合の主な列：

```text
chromosome  start  end  id  type  label  support  confidence
```

`switches` を指定する場合の列：

```text
chromosome  path  position
```

`path` は `CUNphKi` または `CUNphKu` を指定します。

このODGI経路は、coverage、inversion、外部から与えたイベント／切替位置を収録します。`gfa_to_viewer.py` が計算する親hap類似度や親由来スコアは生成しないため、ビューワの一部表示は使えません。

## 出力の確認

```bash
python3 -m json.tool dist/data/citrus_ch1-ch9.viewer.json >/dev/null
python3 -m http.server 8000 --directory dist
```

ブラウザで `http://localhost:8000/` を開きます。HTMLを直接開くと、ブラウザの制限でJSONを読み込めないことがあります。

## 主な注意点

- 出力は参照パスへの投影であり、一般的なノード・エッジ図そのものではありません。
- coverageはリード深度や塩基配列identityではなく、参照区間に投影された共有GFAノードの割合です。
- BUBBLEは正式なbubble decompositionではなく、一部パスだけに参照共有ノードがある連続ビンです。
- 親由来、経路切替、逆向き領域はいずれも探索候補です。塩基レベルアラインメントやread supportによる追加検証が必要です。

