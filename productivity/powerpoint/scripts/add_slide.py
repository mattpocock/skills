"""Add a new slide to an unpacked PPTX directory.

Usage: python add_slide.py <unpacked_dir> <source>

The source can be:
  - A slide file (e.g., slide2.xml) - duplicates the slide
  - A layout file (e.g., slideLayout2.xml) - creates from layout

Examples:
    python add_slide.py unpacked/ slide2.xml
    # Duplicates slide2, creates slide5.xml

    python add_slide.py unpacked/ slideLayout2.xml
    # Creates slide5.xml from slideLayout2.xml

To see available layouts: ls unpacked/ppt/slideLayouts/

Prints the <p:sldId> element to add to presentation.xml.
"""

import re
import shutil
import sys
from pathlib import Path


def get_next_slide_number(slides_dir: Path) -> int:
    existing = [int(m.group(1)) for f in slides_dir.glob("slide*.xml")
                if (m := re.match(r"slide(\d+)\.xml", f.name))]
    return max(existing) + 1 if existing else 1


def create_slide_from_layout(unpacked_dir: Path, layout_file: str) -> None:
    slides_dir = unpacked_dir / "ppt" / "slides"
    rels_dir = slides_dir / "_rels"
    layouts_dir = unpacked_dir / "ppt" / "slideLayouts"

    layout_path = layouts_dir / layout_file
    if not layout_path.exists():
        print(f"Error: {layout_path} not found", file=sys.stderr)
        sys.exit(1)

    next_num = get_next_slide_number(slides_dir)
    dest = f"slide{next_num}.xml"
    dest_slide = slides_dir / dest
    dest_rels = rels_dir / f"{dest}.rels"

    slide_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>'''
    dest_slide.write_text(slide_xml, encoding="utf-8")

    rels_dir.mkdir(exist_ok=True)
    rels_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/{layout_file}"/>
</Relationships>'''
    dest_rels.write_text(rels_xml, encoding="utf-8")

    _add_to_content_types(unpacked_dir, dest)

    rid = _add_to_presentation_rels(unpacked_dir, dest)

    next_slide_id = _get_next_slide_id(unpacked_dir)

    print(f"Created {dest} from {layout_file}")
    print(f'Add to presentation.xml <p:sldIdLst>: <p:sldId id="{next_slide_id}" r:id="{rid}"/>')


def duplicate_slide(unpacked_dir: Path, source: str) -> None:
    slides_dir = unpacked_dir / "ppt" / "slides"
    rels_dir = slides_dir / "_rels"

    source_slide = slides_dir / source

    if not source_slide.exists():
        print(f"Error: {source_slide} not found", file=sys.stderr)
        sys.exit(1)

    next_num = get_next_slide_number(slides_dir)
    dest = f"slide{next_num}.xml"
    dest_slide = slides_dir / dest

    source_rels = rels_dir / f"{source}.rels"
    dest_rels = rels_dir / f"{dest}.rels"

    shutil.copy2(source_slide, dest_slide)

    if source_rels.exists():
        shutil.copy2(source_rels, dest_rels)

        rels_content = dest_rels.read_text(encoding="utf-8")
        rels_content = re.sub(
            r'\s*<Relationship[^>]*Type="[^"]*notesSlide"[^>]*/>\s*',
            "\n",
            rels_content,
        )
        dest_rels.write_text(rels_content, encoding="utf-8")

    _add_to_content_types(unpacked_dir, dest)

    rid = _add_to_presentation_rels(unpacked_dir, dest)

    next_slide_id = _get_next_slide_id(unpacked_dir)

    print(f"Created {dest} from {source}")
    print(f'Add to presentation.xml <p:sldIdLst>: <p:sldId id="{next_slide_id}" r:id="{rid}"/>')


def _add_to_content_types(unpacked_dir: Path, dest: str) -> None:
    content_types_path = unpacked_dir / "[Content_Types].xml"
    content_types = content_types_path.read_text(encoding="utf-8")

    new_override = f'<Override PartName="/ppt/slides/{dest}" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'

    if f"/ppt/slides/{dest}" not in content_types:
        content_types = content_types.replace("</Types>", f"  {new_override}\n</Types>")
        content_types_path.write_text(content_types, encoding="utf-8")


def _add_to_presentation_rels(unpacked_dir: Path, dest: str) -> str:
    pres_rels_path = unpacked_dir / "ppt" / "_rels" / "presentation.xml.rels"
    pres_rels = pres_rels_path.read_text(encoding="utf-8")

    rids = [int(m) for m in re.findall(r'Id="rId(\d+)"', pres_rels)]
    next_rid = max(rids) + 1 if rids else 1
    rid = f"rId{next_rid}"

    new_rel = f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/{dest}"/>'

    if f"slides/{dest}" not in pres_rels:
        pres_rels = pres_rels.replace("</Relationships>", f"  {new_rel}\n</Relationships>")
        pres_rels_path.write_text(pres_rels, encoding="utf-8")

    return rid


def _get_next_slide_id(unpacked_dir: Path) -> int:
    pres_path = unpacked_dir / "ppt" / "presentation.xml"
    pres_content = pres_path.read_text(encoding="utf-8")
    slide_ids = [int(m) for m in re.findall(r'<p:sldId[^>]*id="(\d+)"', pres_content)]
    return max(slide_ids) + 1 if slide_ids else 256


def parse_source(source: str) -> tuple[str, str | None]:
    if source.startswith("slideLayout") and source.endswith(".xml"):
        return ("layout", source)

    return ("slide", None)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python add_slide.py <unpacked_dir> <source>", file=sys.stderr)
        print("", file=sys.stderr)
        print("Source can be:", file=sys.stderr)
        print("  slide2.xml        - duplicate an existing slide", file=sys.stderr)
        print("  slideLayout2.xml  - create from a layout template", file=sys.stderr)
        print("", file=sys.stderr)
        print("To see available layouts: ls <unpacked_dir>/ppt/slideLayouts/", file=sys.stderr)
        sys.exit(1)

    unpacked_dir = Path(sys.argv[1])
    source = sys.argv[2]

    if not unpacked_dir.exists():
        print(f"Error: {unpacked_dir} not found", file=sys.stderr)
        sys.exit(1)

    source_type, layout_file = parse_source(source)

    if source_type == "layout" and layout_file is not None:
        create_slide_from_layout(unpacked_dir, layout_file)
    else:
        duplicate_slide(unpacked_dir, source)
