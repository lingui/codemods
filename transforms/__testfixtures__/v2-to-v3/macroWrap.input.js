import { i18n } from "@lingui/core";
import { t, plural, select, selectOrdinal } from "@lingui/macro";

i18n._(t`Some input`)
i18n._(
  plural({
    value: 1,
    one: 'SORT_#_RESULT_BY:',
    other: 'SORT_#_RESULT_BY:',
    zero: 'SORT_#_RESULTS_BY:'
  })
)
i18n._(
  select({
    value: 2,
    other: 'SORT_#_RESULT_BY:',
  })
)
i18n._(
  selectOrdinal({
    value: 1,
    one: 'SORT_#_RESULT_BY:',
    other: 'SORT_#_RESULT_BY:',
    zero: 'SORT_#_RESULTS_BY:'
  })
)