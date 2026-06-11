from decimal import Decimal


POINTS_TABLE = {
    (1, 0): {"in_catchment": Decimal("58"), "out_of_catchment": Decimal("41")},
    (1, 1): {"in_catchment": Decimal("91"), "out_of_catchment": Decimal("64")},
    (1, 2): {"in_catchment": Decimal("124"), "out_of_catchment": Decimal("86")},
    (1, 3): {"in_catchment": Decimal("152"), "out_of_catchment": Decimal("107")},
    (1, 4): {"in_catchment": Decimal("178"), "out_of_catchment": Decimal("124")},
    (1, 5): {"in_catchment": Decimal("211"), "out_of_catchment": Decimal("147")},
    (1, 6): {"in_catchment": Decimal("231"), "out_of_catchment": Decimal("162")},
    (1, 7): {"in_catchment": Decimal("247"), "out_of_catchment": Decimal("173")},
    (2, 0): {"in_catchment": Decimal("106"), "out_of_catchment": Decimal("74")},
    (2, 1): {"in_catchment": Decimal("138"), "out_of_catchment": Decimal("96")},
    (2, 2): {"in_catchment": Decimal("166"), "out_of_catchment": Decimal("116")},
    (2, 3): {"in_catchment": Decimal("191"), "out_of_catchment": Decimal("133")},
    (2, 4): {"in_catchment": Decimal("224"), "out_of_catchment": Decimal("157")},
    (2, 5): {"in_catchment": Decimal("243"), "out_of_catchment": Decimal("170")},
    (2, 6): {"in_catchment": Decimal("259"), "out_of_catchment": Decimal("181")},
    (2, 7): {"in_catchment": Decimal("289"), "out_of_catchment": Decimal("202")},
    (3, 0): {"in_catchment": Decimal("152"), "out_of_catchment": Decimal("106")},
    (3, 1): {"in_catchment": Decimal("180"), "out_of_catchment": Decimal("126")},
    (3, 2): {"in_catchment": Decimal("204"), "out_of_catchment": Decimal("142")},
    (3, 3): {"in_catchment": Decimal("236"), "out_of_catchment": Decimal("166")},
    (3, 4): {"in_catchment": Decimal("255"), "out_of_catchment": Decimal("179")},
    (3, 5): {"in_catchment": Decimal("271"), "out_of_catchment": Decimal("189")},
    (3, 6): {"in_catchment": Decimal("300"), "out_of_catchment": Decimal("210")},
    (3, 7): {"in_catchment": Decimal("330"), "out_of_catchment": Decimal("231")},
    (4, 0): {"in_catchment": Decimal("193"), "out_of_catchment": Decimal("135")},
    (4, 1): {"in_catchment": Decimal("216"), "out_of_catchment": Decimal("151")},
    (4, 2): {"in_catchment": Decimal("249"), "out_of_catchment": Decimal("175")},
    (4, 3): {"in_catchment": Decimal("267"), "out_of_catchment": Decimal("187")},
    (4, 4): {"in_catchment": Decimal("282"), "out_of_catchment": Decimal("197")},
    (4, 5): {"in_catchment": Decimal("312"), "out_of_catchment": Decimal("218")},
    (4, 6): {"in_catchment": Decimal("341"), "out_of_catchment": Decimal("239")},
    (4, 7): {"in_catchment": Decimal("371"), "out_of_catchment": Decimal("259")},
    (5, 0): {"in_catchment": Decimal("229"), "out_of_catchment": Decimal("161")},
    (5, 1): {"in_catchment": Decimal("262"), "out_of_catchment": Decimal("184")},
    (5, 2): {"in_catchment": Decimal("280"), "out_of_catchment": Decimal("196")},
    (5, 3): {"in_catchment": Decimal("294"), "out_of_catchment": Decimal("206")},
    (5, 4): {"in_catchment": Decimal("323"), "out_of_catchment": Decimal("226")},
    (5, 5): {"in_catchment": Decimal("353"), "out_of_catchment": Decimal("247")},
    (5, 6): {"in_catchment": Decimal("382"), "out_of_catchment": Decimal("267")},
    (5, 7): {"in_catchment": Decimal("412"), "out_of_catchment": Decimal("288")},
    (6, 0): {"in_catchment": Decimal("275"), "out_of_catchment": Decimal("193")},
    (6, 1): {"in_catchment": Decimal("292"), "out_of_catchment": Decimal("204")},
    (6, 2): {"in_catchment": Decimal("305"), "out_of_catchment": Decimal("214")},
    (6, 3): {"in_catchment": Decimal("335"), "out_of_catchment": Decimal("234")},
    (6, 4): {"in_catchment": Decimal("364"), "out_of_catchment": Decimal("255")},
    (6, 5): {"in_catchment": Decimal("394"), "out_of_catchment": Decimal("276")},
    (6, 6): {"in_catchment": Decimal("423"), "out_of_catchment": Decimal("296")},
    (6, 7): {"in_catchment": Decimal("506"), "out_of_catchment": Decimal("354")},
    (7, 0): {"in_catchment": Decimal("304"), "out_of_catchment": Decimal("213")},
    (7, 1): {"in_catchment": Decimal("317"), "out_of_catchment": Decimal("222")},
    (7, 2): {"in_catchment": Decimal("346"), "out_of_catchment": Decimal("242")},
    (7, 3): {"in_catchment": Decimal("376"), "out_of_catchment": Decimal("263")},
    (7, 4): {"in_catchment": Decimal("405"), "out_of_catchment": Decimal("284")},
    (7, 5): {"in_catchment": Decimal("435"), "out_of_catchment": Decimal("304")},
    (7, 6): {"in_catchment": Decimal("519"), "out_of_catchment": Decimal("363")},
    (7, 7): {"in_catchment": Decimal("552"), "out_of_catchment": Decimal("386")},
}


def calculate_starting_balance(num_adults, num_children, catchment_area):
    if num_adults < 1 or num_adults > 7:
        raise ValueError("num_adults must be between 1 and 7")
    if num_children < 0 or num_children > 7:
        raise ValueError("num_children must be between 0 and 7")

    entry = POINTS_TABLE[(num_adults, num_children)]
    return entry["in_catchment"] if catchment_area else entry["out_of_catchment"]
