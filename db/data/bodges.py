import re


def process_receiving_water(value):
    if value == "":
        value = "UNKNOWN"

    value = value.lower()

    value = re.sub(r"\s+", " ", value)
    value = value.replace("un-named tributary of", "tributary of")
    value = value.replace("un-named trib of", "tributary of")
    value = value.replace("unnamed tribuatory to", "tributary of")
    value = value.replace("unnamed tributary of", "tributary of")
    value = value.replace("unnamed trib of", "tributary of")
    value = value.replace("a trib of", "")
    value = value.replace("trib of", "")
    value = value.replace("named tributary of", "tributary of")
    value = value.replace("named tributary", "tributary")
    value = value.replace("a tributary of", "")
    value = value.replace("tributary of", "")
    value = value.replace("tributary", "")
    value = value.replace("trib.", "")
    value = value.replace("trib", "")
    value = value.replace("estuary - ", "")
    # value = value.replace("river", "")

    value = re.sub(r"&.*", r"", value)
    value = re.sub(r"\(.*", r"", value)
    value = re.sub(r"\)", r"", value)
    value = re.sub(r"ditch (.*)", r"\1", value)
    value = re.sub(r"the\s(.*)", r"\1", value)
    value = re.sub(r"[rR]\.\s?(.*)", r"River \1", value)
    value = re.sub(r"(.*) nt", r"\1", value)
    value = re.sub(r"(\s)wter\s", r"\1water", value)
    value = re.sub(r"\bafon\b", r"river", value)
    value = value.strip()

    if value == "":
        value = "unknown"

    value = value.title()
    value = re.sub(r"\s+", " ", value)
    return value


def test_process_receiving_water():
    assert process_receiving_water("TRIBUTARY (DITCH) OF THE BECK") == "Unknown"
    assert process_receiving_water("Trib") == "Unknown"
    assert process_receiving_water("") == "Unknown"
    assert process_receiving_water("LAND") == "Land"
    assert process_receiving_water("A TRIB OF THE RIVER EDEN") == "River Eden"
    assert process_receiving_water("A TRIBUTARY OF RIVER WEY") == "River Wey"
    assert process_receiving_water("TRIB. COWFOLD STREAM") == "Cowfold Stream"
    assert process_receiving_water("TRIB OF RIVER BURE") == "River Bure"
    assert process_receiving_water("named tributary of River Wensum") == "River Wensum"
    assert process_receiving_water("TRIBUTARY  OF RIVER WENSUM") == "River Wensum"
    assert process_receiving_water("named tributary River Wensum") == "River Wensum"
    assert process_receiving_water("tributary River Wensum") == "River Wensum"
    assert process_receiving_water("UNNAMED TRIB OF RIVER WENSUM") == "River Wensum"
    assert process_receiving_water("Trib River Stour") == "River Stour"
    assert process_receiving_water("THE RIVER WENSUM (TIDAL)") == "River Wensum"
    assert process_receiving_water("TRIBUTARY OF THE RIVER STOUR") == "River Stour"
    assert process_receiving_water("R. Ouze") == "River Ouze"
    assert process_receiving_water("Ditch River Wensum NT") == "River Wensum"
    assert process_receiving_water("Old Moor Drain ( Pulfor") == "Old Moor Drain"
    assert process_receiving_water("LAND (RTGRAVELS OVER FKSTNBEDS") == "Land"
    assert process_receiving_water("UNNAMED TRIB OF THE DEAN BURN)") == "Dean Burn"
    assert process_receiving_water("TAW ESTUARY(E) & CONEY GUT(S)") == "Taw Estuary"
    assert process_receiving_water("TAW ESTUARY & TRIBUTARY(E)") == "Taw Estuary"
    assert process_receiving_water("R.THAMES ( TIDAL )") == "River Thames"
    assert process_receiving_water("UN-NAMED TRIB OF THE R. STORT") == "River Stort"
    assert process_receiving_water("KNOWLE WTER & MID MARWOOD STRM") == "Knowle Water"
    assert process_receiving_water("CRAWTERS BROOK") == "Crawters Brook"
    assert process_receiving_water("ESTUARY - AFON GLASLYN") == "River Glaslyn"
    assert process_receiving_water("Unnamed Tribuatory to Afon Glaslyn") == "River Glaslyn"
