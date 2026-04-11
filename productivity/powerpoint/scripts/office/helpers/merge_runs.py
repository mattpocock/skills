"""Merge adjacent runs with identical formatting in DOCX.

Merges adjacent <w:r> elements that have identical <w:rPr> properties.
Works on runs in paragraphs and inside tracked changes (<w:ins>, <w:del>).

Also:
- Removes rsid attributes from runs (revision metadata that doesn't affect rendering)
- Removes proofErr elements (spell/grammar markers that block merging)
"""

from pathlib import Path

import defusedxml.minidom


def merge_runs(input_dir: str) -> tuple[int, str]:
    doc_xml = Path(input_dir) / "word" / "document.xml"

    if not doc_xml.exists():
        return 0, f"Error: {doc_xml} not found"

    try:
        dom = defusedxml.minidom.parseString(doc_xml.read_text(encoding="utf-8"))
        root = dom.documentElement

        _remove_elements(root, "proofErr")
        _strip_run_rsid_attrs(root)

        containers = {run.parentNode for run in _find_elements(root, "r")}

        merge_count = 0
        for container in containers:
            merge_count += _merge_runs_in(container)

        doc_xml.write_bytes(dom.toxml(encoding="UTF-8"))
        return merge_count, f"Merged {merge_count} runs"

    except Exception as e:
        return 0, f"Error: {e}"




def _find_elements(root, tag: str) -> list:
    results = []

    def traverse(node):
        if node.nodeType == node.ELEMENT_NODE:
            name = node.localName or node.tagName
            if name == tag or name.endswith(f":{tag}"):
                results.append(node)
            for child in node.childNodes:
                traverse(child)

    traverse(root)
    return results


def _get_child(parent, tag: str):
    for child in parent.childNodes:
        if child.nodeType == child.ELEMENT_NODE:
            name = child.localName or child.tagName
            if name == tag or name.endswith(f":{tag}"):
                return child
    return None


def _get_children(parent, tag: str) -> list:
    results = []
    for child in parent.childNodes:
        if child.nodeType == child.ELEMENT_NODE:
            name = child.localName or child.tagName
            if name == tag or name.endswith(f":{tag}"):
                results.append(child)
    return results


def _is_adjacent(elem1, elem2) -> bool:
    node = elem1.nextSibling
    while node:
        if node == elem2:
            return True
        if node.nodeType == node.ELEMENT_NODE:
            return False
        if node.nodeType == node.TEXT_NODE and node.data.strip():
            return False
        node = node.nextSibling
    return False




def _remove_elements(root, tag: str):
    for elem in _find_elements(root, tag):
        if elem.parentNode:
            elem.parentNode.removeChild(elem)


def _strip_run_rsid_attrs(root):
    for run in _find_elements(root, "r"):
        for attr in list(run.attributes.values()):
            if "rsid" in attr.name.lower():
                run.removeAttribute(attr.name)




def _merge_runs_in(container) -> int:
    merge_count = 0
    run = _first_child_run(container)

    while run:
        while True:
            next_elem = _next_element_sibling(run)
            if next_elem and _is_run(next_elem) and _can_merge(run, next_elem):
                _merge_run_content(run, next_elem)
                container.removeChild(next_elem)
                merge_count += 1
            else:
                break

        _consolidate_text(run)
        run = _next_sibling_run(run)

    return merge_count


def _first_child_run(container):
    for child in container.childNodes:
        if child.nodeType == child.ELEMENT_NODE and _is_run(child):
            return child
    return None


def _next_element_sibling(node):
    sibling = node.nextSibling
    while sibling:
        if sibling.nodeType == sibling.ELEMENT_NODE:
            return sibling
        sibling = sibling.nextSibling
    return None


def _next_sibling_run(node):
    sibling = node.nextSibling
    while sibling:
        if sibling.nodeType == sibling.ELEMENT_NODE:
            if _is_run(sibling):
                return sibling
        sibling = sibling.nextSibling
    return None


def _is_run(node) -> bool:
    name = node.localName or node.tagName
    return name == "r" or name.endswith(":r")


def _can_merge(run1, run2) -> bool:
    rpr1 = _get_child(run1, "rPr")
    rpr2 = _get_child(run2, "rPr")

    if (rpr1 is None) != (rpr2 is None):
        return False
    if rpr1 is None:
        return True
    return rpr1.toxml() == rpr2.toxml()  


def _merge_run_content(target, source):
    for child in list(source.childNodes):
        if child.nodeType == child.ELEMENT_NODE:
            name = child.localName or child.tagName
            if name != "rPr" and not name.endswith(":rPr"):
                target.appendChild(child)


def _consolidate_text(run):
    t_elements = _get_children(run, "t")

    for i in range(len(t_elements) - 1, 0, -1):
        curr, prev = t_elements[i], t_elements[i - 1]

        if _is_adjacent(prev, curr):
            prev_text = prev.firstChild.data if prev.firstChild else ""
            curr_text = curr.firstChild.data if curr.firstChild else ""
            merged = prev_text + curr_text

            if prev.firstChild:
                prev.firstChild.data = merged
            else:
                prev.appendChild(run.ownerDocument.createTextNode(merged))

            if merged.startswith(" ") or merged.endswith(" "):
                prev.setAttribute("xml:space", "preserve")
            elif prev.hasAttribute("xml:space"):
                prev.removeAttribute("xml:space")

            run.removeChild(curr)
