if (!(typeof window === 'undefined')) global=window

global.knit = {
  algebra: {predicate:{}},
  mixin:{},
  translation:{sql:{}},
  engine:{  /*hrm.  begone.*/ memory:{}, sqlite:{}  },
  attributeType:{}
}