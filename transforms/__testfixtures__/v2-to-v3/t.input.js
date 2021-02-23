import { i18n } from "@lingui/core";
import { t, plural, select, selectOrdinal } from "@lingui/macro";

t`Some input`
t('my.id')`Some input`
const value = 1
t('my.id')`Some value (${value})`
t('my.id')`Some complex value (${value.toFixed(2)})`
const withComment = /**i18n: a description of the message*/t`Some message`
test`no transform`
test('id')`no transform`
