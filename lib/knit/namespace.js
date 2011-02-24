if (!(typeof window === 'undefined')) global=window

global.knit = {
  algebra: {predicate:{}},
  mixin:{},
  translation:{sql:{}},
  engine:{ memory:{}, sqlite:{} },
  attributeType:{}
}