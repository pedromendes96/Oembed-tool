export default {
  vimeo: {
    regex: /(?:http[s]?:\/\/)?(?:www.)?vimeo\.co(?:.+\/([^\/]\d+)(?:#t=[\d]+)?s?$)/,
    embedUrl:
      "https://player.vimeo.com/video/<%= remote_id %>?title=0&byline=0",
    html: '<iframe style="width:100%;" height="320" frameborder="0"></iframe>',
    height: 320,
    width: 580
  },
  youtube: {
    regex: /(?:https?:\/\/)?(?:www\.)?(?:(?:youtu\.be\/)|(?:youtube\.com)\/(?:v\/|u\/\w\/|embed\/|watch))(?:(?:\?v=)?([^#&?=]*))?((?:[?&]\w*=\w*)*)/,
    embedUrl: "https://www.youtube.com/embed/<%= remote_id %>",
    html:
      '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580,
    id: ([id, params]) => {
      if (!params && id) {
        return id;
      }

      const paramsMap = {
        start: "start",
        end: "end",
        t: "start",
        time_continue: "start",
        list: "list"
      };

      params = params
        .slice(1)
        .split("&")
        .map(param => {
          const [name, value] = param.split("=");

          if (!id && name === "v") {
            id = value;
            return;
          }

          if (!paramsMap[name]) return;

          return `${paramsMap[name]}=${value}`;
        })
        .filter(param => !!param);

      return id + "?" + params.join("&");
    }
  },
  coub: {
    regex: /https?:\/\/coub\.com\/view\/([^\/\?\&]+)/,
    embedUrl: "https://coub.com/embed/<%= remote_id %>",
    html:
      '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580
  },
  vine: {
    regex: /https?:\/\/vine\.co\/v\/([^\/\?\&]+)/,
    embedUrl: "https://vine.co/v/<%= remote_id %>/embed/simple/",
    html:
      '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580
  },
  imgur: {
    regex: /https?:\/\/(?:i\.)?imgur\.com.*\/([a-zA-Z0-9]+)(?:\.gifv)?/,
    embedUrl: "http://imgur.com/<%= remote_id %>/embed",
    html:
      '<iframe allowfullscreen="true" scrolling="no" id="imgur-embed-iframe-pub-<%= remote_id %>" class="imgur-embed-iframe-pub" style="height: 500px; width: 100%; border: 1px solid #000"></iframe>',
    height: 500,
    width: 540
  },
  gfycat: {
    regex: /https?:\/\/gfycat\.com(?:\/detail)?\/([a-zA-Z]+)/,
    embedUrl: "https://gfycat.com/ifr/<%= remote_id %>",
    html:
      "<iframe frameborder='0' scrolling='no' style=\"width:100%;\" height='436' allowfullscreen ></iframe>",
    height: 436,
    width: 580
  },
  "twitch-channel": {
    regex: /https?:\/\/www\.twitch\.tv\/([^\/\?\&]*)\/?$/,
    embedUrl: "https://player.twitch.tv/?channel=<%= remote_id %>",
    html:
      '<iframe frameborder="0" allowfullscreen="true" scrolling="no" height="366" style="width:100%;"></iframe>',
    height: 366,
    width: 600
  },
  "twitch-video": {
    regex: /https?:\/\/www\.twitch\.tv\/(?:[^\/\?\&]*\/v|videos)\/([0-9]*)/,
    embedUrl: "https://player.twitch.tv/?video=v<%= remote_id %>",
    html:
      '<iframe frameborder="0" allowfullscreen="true" scrolling="no" height="366" style="width:100%;"></iframe>',
    height: 366,
    width: 600
  },
  "yandex-music-album": {
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/?$/,
    embedUrl: "https://music.yandex.ru/iframe/#album/<%= remote_id %>/",
    html:
      '<iframe frameborder="0" style="border:none;width:540px;height:400px;" style="width:100%;" height="400"></iframe>',
    height: 400,
    width: 540
  },
  "yandex-music-track": {
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/track\/([0-9]*)/,
    embedUrl: "https://music.yandex.ru/iframe/#track/<%= remote_id %>/",
    html:
      '<iframe frameborder="0" style="border:none;width:540px;height:100px;" style="width:100%;" height="100"></iframe>',
    height: 100,
    width: 540,
    id: ids => ids.join("/")
  },
  "yandex-music-playlist": {
    regex: /https?:\/\/music\.yandex\.ru\/users\/([^\/\?\&]*)\/playlists\/([0-9]*)/,
    embedUrl:
      "https://music.yandex.ru/iframe/#playlist/<%= remote_id %>/show/cover/description/",
    html:
      '<iframe frameborder="0" style="border:none;width:540px;height:400px;" width="540" height="400"></iframe>',
    height: 400,
    width: 540,
    id: ids => ids.join("/")
  },
  codepen: {
    regex: /https?:\/\/codepen\.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
    embedUrl:
      "https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2",
    html:
      "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
    height: 300,
    width: 600,
    id: ids => ids.join("/embed/")
  },
  instagram: {
    regex: /(https?:\/\/(?:www\.)?instagram\.com\/p\/([^\/?#&]+)).*(((\?|\&)([^=]+)\=([^&]+))*)?/g,
    oembedUrl: "https://api.instagram.com/oembed",
    useServerSide: true
  },
  "twitter-tweet": {
    regex: /^https?:\/\/twitter\.com\/(\w+)\/status(es)?\/(\d+)(((\?|\&)([^=]+)\=([^&]+))*)?$/,
    oembedUrl: "https://publish.twitter.com/oembed",
    useServerSide: true
  },
  "twitter-moments": {
    regex: /^https?:\/\/twitter\.com\/i\/moments?\/(\d+)(((\?|\&)([^=]+)\=([^&]+))*)?$/,
    oembedUrl: "https://publish.twitter.com/oembed",
    useServerSide: true
  },
  "twitter-timeline": {
    regex: /^https?:\/\/twitter\.com\/(\w+)(((\?|\&)([^=]+)\=([^&]+))*)?$/,
    oembedUrl: "https://publish.twitter.com/oembed",
    useServerSide: true
  },
  "facebook-post": {
    regex: /(https:\/\/www\.facebook\.com\/.+\/(posts|activity)\/.+|https:\/\/www\.facebook\.com\/photo\.php\?fbid=.+|https:\/\/www\.facebook\.com\/(photos|questions)\/.+|https:\/\/www\.facebook\.com\/permalink\.php\?story_fbid=.+|https:\/\/www\.facebook\.com\/media\/set\?set=.+|https:\/\/www\.facebook\.com\/notes\/.+\/.+\/.+)(((\?|\&)([^=]+)\=([^&]+))*)?/,
    oembedUrl: "https://www.facebook.com/plugins/post/oembed.json",
    useServerSide: true
  },
  "facebook-video": {
    regex: /(https:\/\/www.facebook.com\/.+\/videos\/.+|https:\/\/www\.facebook\.com\/video\.php\?(id|v)=.+)(((\?|\&)([^=]+)\=([^&]+))*)?/,
    oembedUrl: "https://www.facebook.com/plugins/video/oembed.json",
    useServerSide: true
  },
  "pinterest-pin": {
    regex: /https?:\/\/www.pinterest.com\/pin\/([^\/\?\&]*)\/(((\?|\&)([^=]+)\=([^&]+))*)?/,
    embedUrl: "https://www.pinterest.com/pin/<%= remote_id %>/",
    html:
      '<a data-pin-do="embedPin" data-pin-terse="true"></a><script async defer src="//assets.pinterest.com/js/pinit_main.js"></script>',
    id: groups => {
      return groups[0];
    }
  },
  "pinterest-board": {
    regex: /https?:\/\/www.pinterest.com\/([^\/\?\&]*)\/([^\/\?\&]*)\/(((\?|\&)([^=]+)\=([^&]+))*)?/,
    embedUrl: "https://www.pinterest.com/<%= remote_id %>",
    html:
      '<a data-pin-do="embedBoard" data-pin-board-width="400" data-pin-scale-height="240" data-pin-scale-width="80"></a><script async defer src="//assets.pinterest.com/js/pinit_main.js"></script>',
    id: groups => groups.join("/")
  },
  "pinterest-profile": {
    regex: /https?:\/\/www.pinterest.com\/([^\/\?\&]*)\/(((\?|\&)([^=]+)\=([^&]+))*)?/,
    embedUrl: "https://www.pinterest.com/<%= remote_id %>",
    html:
      '<a data-pin-do="embedUser" data-pin-board-width="400" data-pin-scale-height="240" data-pin-scale-width="80"></a><script async defer src="//assets.pinterest.com/js/pinit_main.js"></script>',
    id: groups => groups[0]
  }
};
