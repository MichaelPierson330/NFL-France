
import json
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

CHANNEL_ID = "UCnPNSG3C02W0qVhb8E8u20g"
FEED_URL = (
    f"https://www.youtube.com/feeds/videos.xml"
    f"?channel_id={CHANNEL_ID}"
)

OUTPUT = Path("videos.json")

ATOM = "{http://www.w3.org/2005/Atom}"
YT = "{http://www.youtube.com/xml/schemas/2015}"

request = urllib.request.Request(
    FEED_URL,
    headers={"User-Agent": "Mozilla/5.0"}
)

with urllib.request.urlopen(request, timeout=30) as response:
    xml_data = response.read()

root = ET.fromstring(xml_data)

nouvelles_videos = []

for entry in root.findall(f"{ATOM}entry"):
    video_id = entry.findtext(f"{YT}videoId")
    titre = entry.findtext(f"{ATOM}title")
    date = entry.findtext(f"{ATOM}published")

    if not video_id:
        continue

    nouvelles_videos.append({
        "id": video_id,
        "titre": titre or "Vidéo NFL Extra",
        "date": date or "",
        "image": (
            f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        ),
        "url": (
            f"https://www.youtube.com/watch?v={video_id}"
        )
    })

anciennes_videos = []

if OUTPUT.exists():
    try:
        anciennes_videos = json.loads(
            OUTPUT.read_text(encoding="utf-8")
        )
    except (json.JSONDecodeError, OSError):
        pass

videos_par_id = {}

for video in anciennes_videos + nouvelles_videos:
    if video.get("id"):
        videos_par_id[video["id"]] = video

videos = sorted(
    videos_par_id.values(),
    key=lambda video: video.get("date", ""),
    reverse=True
)[:50]

OUTPUT.write_text(
    json.dumps(videos, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8"
)

print(f"{len(videos)} vidéos enregistrées dans videos.json")
