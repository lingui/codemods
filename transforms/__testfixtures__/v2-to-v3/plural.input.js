import { plural } from "@lingui/macro"

const value = "value";
plural({ value: "hola", one: "a", other: "b" });
plural({ value, one: "a", other: "b" });
