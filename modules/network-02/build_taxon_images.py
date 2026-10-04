#!/usr/bin/env python3
import json, os, re, sys, time, hashlib
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/"assets"/"data"/"ribb_web.json"
OUTDIR=ROOT/"assets"/"taxa"
MANIFEST=ROOT/"assets"/"data"/"taxon_images.json"
OUTDIR.mkdir(parents=True, exist_ok=True)

UA="RIBB-Kennedy-image-cache/1.0"

def fetch_json(url, timeout=12):
    req=Request(url, headers={"User-Agent":UA})
    with urlopen(req, timeout=timeout) as r:
        return json.load(r)

def fetch_bytes(url, timeout=15):
    req=Request(url, headers={"User-Agent":UA})
    with urlopen(req, timeout=timeout) as r:
        return r.read()

def safe_name(name):
    h=hashlib.sha1(name.encode("utf-8")).hexdigest()[:12]
    slug=re.sub(r"[^a-z0-9]+","-",name.lower()).strip("-")[:50]
    return f"{slug}-{h}.webp"

def iNat_photo(name):
    q=quote(name)
    urls=[
        f"https://api.inaturalist.org/v1/taxa?q={q}&per_page=12",
        f"https://api.inaturalist.org/v1/taxa/autocomplete?q={q}&per_page=12"
    ]
    for u in urls:
        try:
            j=fetch_json(u)
            results=j.get("results",[])
            exact=next((x for x in results if (x.get("name") or "").lower()==name.lower() and x.get("default_photo")),None)
            cand=exact or next((x for x in results if x.get("default_photo")),None)
            if cand:
                p=cand["default_photo"]
                url=p.get("medium_url") or p.get("square_url") or p.get("url")
                if url:
                    return {
                        "url":url,
                        "source":"iNaturalist",
                        "matched":cand.get("name") or name,
                        "exact":bool(exact),
                        "source_url":f"https://www.inaturalist.org/taxa/{cand.get('id')}" if cand.get("id") else ""
                    }
        except Exception:
            pass
    parts=name.split()
    if len(parts)>1:
        genus=parts[0]
        try:
            j=fetch_json(f"https://api.inaturalist.org/v1/taxa/autocomplete?q={quote(genus)}&per_page=12")
            cand=next((x for x in j.get("results",[]) if x.get("default_photo")),None)
            if cand:
                p=cand["default_photo"]
                url=p.get("medium_url") or p.get("square_url") or p.get("url")
                if url:
                    return {
                        "url":url,
                        "source":"iNaturalist",
                        "matched":cand.get("name") or genus,
                        "exact":False,
                        "source_url":f"https://www.inaturalist.org/taxa/{cand.get('id')}" if cand.get("id") else ""
                    }
        except Exception:
            pass
    return None

def save_webp(raw, dest):
    im=Image.open(BytesIO(raw)).convert("RGB")
    im=ImageOps.fit(im,(320,320),method=Image.Resampling.LANCZOS)
    im.save(dest,"WEBP",quality=68,method=6)

def process(name):
    fn=safe_name(name)
    dest=OUTDIR/fn
    if dest.exists() and dest.stat().st_size>1000:
        return name, {"path":f"../../assets/taxa/{fn}","source":"local-cache","exact":None}
    info=iNat_photo(name)
    if not info:
        return name, {"path":"","source":"","exact":False,"status":"missing"}
    try:
        raw=fetch_bytes(info["url"])
        save_webp(raw,dest)
        return name, {
            "path":f"../../assets/taxa/{fn}",
            "source":info["source"],
            "source_url":info.get("source_url",""),
            "matched":info.get("matched",name),
            "exact":info.get("exact",False),
            "status":"ok"
        }
    except Exception as e:
        return name, {"path":"","source":info["source"],"exact":info.get("exact",False),"status":"download-failed"}

def main():
    with DATA.open("r",encoding="utf-8") as f:
        data=json.load(f)
    raw_nodes=data.get("nodes",[])
    names=[]
    for n in raw_nodes:
        if isinstance(n,str): names.append(n)
        elif isinstance(n,dict):
            v=n.get("id") or n.get("name") or n.get("taxon") or n.get("scientificName")
            if v: names.append(v)
    names=sorted(set(names))
    print(f"Resolving {len(names)} taxa")
    manifest={}
    workers=int(os.environ.get("IMAGE_WORKERS","8"))
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures={ex.submit(process,n):n for n in names}
        done=0
        for fut in as_completed(futures):
            name,info=fut.result()
            manifest[name]=info
            done+=1
            if done%100==0: print(done)
    payload={
        "generated_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),
        "count":len(names),
        "resolved":sum(1 for v in manifest.values() if v.get("path")),
        "taxa":manifest
    }
    MANIFEST.parent.mkdir(parents=True,exist_ok=True)
    MANIFEST.write_text(json.dumps(payload,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    print(f"Resolved {payload['resolved']}/{payload['count']}")

if __name__=="__main__":
    main()
