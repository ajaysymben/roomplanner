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

  //dimensions in inches
  roomHeight: 120,
  roomWidth: 96
});

export default AppViewModel;
