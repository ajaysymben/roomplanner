import AppMap from "can-ssr/app-map";
import route from "can/route/";
import 'can/map/define/';
import 'can/route/pushstate/';

const AppViewModel = AppMap.extend({
  define: {
    message: {
      value: 'Hello World!',
      serialize: false
    },
    title: {
      value: 'svg-roomplanner',
      serialize: false
    }
  },

  isRunningInBrowser: !( typeof process === "object" && {}.toString.call(process) === "[object process]" ),
  //isRunningInNode: typeof process === "object" && {}.toString.call(process) === "[object process]",
  //isRunningInNode2: typeof module !== 'undefined' && module.exports,

  isvgConfig: {
    isRunningInBrowser: !( typeof process === "object" && {}.toString.call(process) === "[object process]" ),

    //SVG's viewBox points ( sort of like pixels ) per 1 unit ( inch or whatever )
    viewBoxPointsPerUnit: 10,

    //grid lines every x units
    gridLinesEvery: 12,

    //dimensions in inches
    height: 24 * 12,
    width: 30 * 12,

    //specify what element parts in the svg can be interacted with
    iQueryString: "> g"
  }

});

export default AppViewModel;
