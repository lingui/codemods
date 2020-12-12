import { i18n } from "@lingui/core";
import { t, plural, select, selectOrdinal } from "@lingui/macro";

t`Some input`
t({
  id: 'my.id',
  message: `Some input`,
})
plural(1, {
  one: 'SORT_#_RESULT_BY:',
  other: 'SORT_#_RESULT_BY:',
  zero: 'SORT_#_RESULTS_BY:'
})
select({
  value: 2,
  other: 'SORT_#_RESULT_BY:',
})
selectOrdinal({
  value: 1,
  one: 'SORT_#_RESULT_BY:',
  other: 'SORT_#_RESULT_BY:',
  zero: 'SORT_#_RESULTS_BY:'
})
