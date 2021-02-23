import { i18n } from "@lingui/core";
import { t, plural, select, selectOrdinal } from "@lingui/macro";

t`Some input`
t({
  id: "my.id",
  message: `Some input`
})
const value = 1
t({
  id: "my.id",
  message: `Some value (${value})`
})
t({
  id: "my.id",
  message: `Some complex value (${value.toFixed(2)})`
})
const withComment = t({
  message: `Some message`,
  comment: "a description of the message"
})
test`no transform`
test('id')`no transform`
