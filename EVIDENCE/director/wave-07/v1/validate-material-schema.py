from copy import deepcopy
from importlib.metadata import version
from pathlib import Path
from jsonschema import Draft202012Validator
import json
import sys

here = Path(__file__).parent
schema = json.loads((here / "material-properties.schema.json").read_text(encoding="utf-8"))
Draft202012Validator.check_schema(schema)
validator = Draft202012Validator(schema)
source = dict(authority="synthetic verification", record="fixture-a", revision="1", status="proposed")
baseline = dict(schema="blob.material-properties.proposal.v1", status="proposed", catalogRevision=1,
                definitions=[dict(id="fixture-a", revision=1, source=source)])
cases = {}
def check(name, instance, expected):
    observed = validator.is_valid(instance)
    assert observed is expected, name
    cases[name] = "PASS"

check("No missing property is given a value", baseline, True)
value = deepcopy(baseline)
value["definitions"][0]["intrinsic"] = {"densityKgM3": -1}
check("Density is strictly positive", value, False)
value["definitions"][0]["intrinsic"] = {"electricalConductivitySm": 0}
check("Valid zero conductivity stays distinct from missing conductivity", value, True)
value["definitions"][0]["intrinsic"] = {"hardnessPa": 1}
check("Hardness requires a matching test method", value, False)
value["definitions"][0].pop("intrinsic")
value["definitions"][0]["composition"] = {"constituents": [{"id": "x", "fraction01": 1}]}
check("Composition shares require definition of their basis", value, False)
value["definitions"][0]["composition"]["basis"] = "inventory_share"
check("Inventory shares are valid on their own basis", value, True)
value["organizationSamples"] = [dict(instanceId="i", form="particulate", source=source, contactRadiusWorldUnits=0.2)]
check("Physical radius requires a sourced shape", value, False)
value["organizationSamples"][0]["geometryRef"] = "synthetic-sphere"
check("Particulate can be a constitutive organization", value, True)
value["contactProfiles"] = [dict(id="fixture", owner="fixture owner", scope="pair", responseRef="none",
                                source=source, restitution01=1.1)]
check("Restitution stays within authored first-slice bounds", value, False)
value["contactProfiles"][0]["restitution01"] = 0
check("Inelastic contact is representable", value, True)
value["contactProfiles"][0]["inertialMassKg"] = 1
check("Inertial mass belongs to the individual instance", value, False)
print(json.dumps({"schema": schema["$id"], "validator": version("jsonschema"), "cases": cases}, indent=2))
