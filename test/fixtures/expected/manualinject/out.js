var test = "test";
var css = ".test { color: blue }";
var _in = {"test":"test"};

var refs = 0;
          
          function useStyle() {
            if (!(refs++)) {
              styleInject(css);
            }
          }

export default _in;
export { test, useStyle };
