# How SMD-MINI originally loaded code

## Public repo (`index.js`)

The GitHub repo does **not** contain the real bot. `index.js` only downloads a remote script:

```js
const url = "https://bandaheali-cdn.koyeb.app/bandaheali/smd-mini.js";
const { data } = await axios.get(url);
fs.writeFileSync("cdn-smd-mini.js", data);
require("./cdn-smd-mini.js");
```

## CDN script (`smd-mini.js` from CDN)

That file is **heavily obfuscated**. After decoding, it is a "secure loader" that:

1. Creates decoy folders (`.npm`, `.xcache`, `.files`)
2. Downloads a **ZIP runtime** from the same CDN
3. Extracts it under a deep path resembling:
   `node_modules/yt-search/.config/rashid/.../hidden-files`
4. Spawns `node index.js` in that directory
5. On crash, deletes and re-downloads ("fetching latest version")

## This fork

We captured the extracted runtime and published it **in clear source**:

- All `plugins/*.js` are readable (not obfuscated)
- Categorized under `plugins/{main,group,download,...}/` for navigation
- Flat copies remain in `plugins/` for original `require` paths
- `docs/PLUGIN_INDEX.md` lists command categories

Original upstream: https://github.com/iTx-Sarkar/SMD-MINI  
CDN host observed: `https://bandaheali-cdn.koyeb.app`
