(function($){

$(document).ready(function(){
  var getCardSize = function(self) {
    var default_size = "height='520'";
    var ret = "";
    if ($(self).attr("srcScaleHeight")) {
      ret += "height='" + $(self).attr("srcScaleHeight") + "' ";
    }
    if ($(self).attr("srcScaleWidth")) {
      ret += "width='" + $(self).attr("srcScaleWidth") + "' ";
    }
    if (ret == "") {
      ret = default_size;
    }
    return ret;
  };
  var ua = navigator.userAgent;
  var is_smartphone = false;
  if(ua.search(/iPhone/) != -1 || ua.search(/iPad/) != -1 || ua.search(/iPod/) != -1 || ua.search(/Android/) != -1){
    is_smartphone = true;
  }
  if (is_smartphone) {
    /* for smartphone */
    var xOffset = 35;
    var yOffset = 10;
    var touch_src = "";
    $('#wrapperIn').click(function(e) {
      if(touch_src != "") {
        touch_src = "";
        $("#cardPreviewContent").remove();
      }
    });
    $('a.cardPreview').click(function(e) {
        if (touch_src === $(this).attr("src")) return true;
        e.preventDefault(); // cancel default click event
        e.stopPropagation(); // cancel default parent event
        $("#cardPreviewContent").remove(); // refresh card image
          // view card iamge start
          var content = "<img id='cardPreviewContent' src='" + $(this).attr("src") + "' " + getCardSize(this) + " />";
          $("body").append(content);
          setTimeout(function(){
            var top = e.pageY;
            if (($(window).scrollTop() + $(window).height()) < (top + $("#cardPreviewContent").height() + yOffset)) {
              top = $(window).scrollTop() + $(window).height() - $("#cardPreviewContent").height() - yOffset;
            }
            $("#cardPreviewContent")
              .css("top",(top) + "px")
              .css("left",(e.pageX + xOffset) + "px")
              .fadeIn("fast");
          }, 200);
          // view card iamge end
          touch_src = $(this).attr("src");
          return false; // cancel anchor event
    });
    $('a.cardPreviewRotate').click(function(e) { // for Event-card
        if (touch_src === $(this).attr("src")) return true;
        e.preventDefault(); // cancel default click event
        e.stopPropagation(); // cancel default parent event
        $("#cardPreviewContent").remove();
          // view card iamge start
          var content = "<img id='cardPreviewContent' src='" + $(this).attr("src") + "' " + getCardSize(this) + " class='cardRotate' />";
          $("body").append(content);
          setTimeout(function(){
            var top = e.pageY;
            if (($(window).scrollTop() + $(window).height()) < (top + $("#cardPreviewContent").width() + yOffset)) {
              top = $(window).scrollTop() + $(window).height() - $("#cardPreviewContent").width() - yOffset;
            }
            $("#cardPreviewContent")
              .css("top",(top) + "px")
              .css("left",(e.pageX + xOffset + $("#cardPreviewContent").height()) + "px")
              .fadeIn("fast");
          }, 200);
          // view card iamge end
          touch_src = $(this).attr("src");
          return false; // cancel anchor event
    });
  } else {
    /* for PC */
    var xOffset = 30;
    var yOffset = 10;
    $("a.cardPreview").hover(function(e){
      var content = "<img id='cardPreviewContent' src='" + $(this).attr("src") + "' " + getCardSize(this) + " />";
      $("body").append(content);
      setTimeout(function(){
        var top = e.pageY;
        if (($(window).scrollTop() + $(window).height()) < (top + $("#cardPreviewContent").height() + yOffset)) {
          top = $(window).scrollTop() + $(window).height() - $("#cardPreviewContent").height() - yOffset;
        }
        $("#cardPreviewContent")
          .css("top",(top) + "px")
          .css("left",(e.pageX + xOffset) + "px")
          .fadeIn("fast");
      }, 200);
    },
    function(){
      $("#cardPreviewContent").remove();
    });
    $("a.cardPreview").mousemove(function(e){
      var top = e.pageY;
      if (($(window).scrollTop() + $(window).height()) < (top + $("#cardPreviewContent").height() + yOffset)) {
        top = $(window).scrollTop() + $(window).height() - $("#cardPreviewContent").height() - yOffset;
      }
      $("#cardPreviewContent")
        .css("top",(top) + "px")
        .css("left",(e.pageX + xOffset) + "px");
    });
    // for Event-card
    $("a.cardPreviewRotate").hover(function(e){
      var content = "<img id='cardPreviewContent' src='" + $(this).attr("src") + "' " + getCardSize(this) + " class='cardRotate' />";
      $("body").append(content);
      setTimeout(function(){
        var top = e.pageY;
        if (($(window).scrollTop() + $(window).height()) < (top + $("#cardPreviewContent").width() + yOffset)) {
          top = $(window).scrollTop() + $(window).height() - $("#cardPreviewContent").width() - yOffset;
        }
        $("#cardPreviewContent")
          .css("top",(top) + "px")
          .css("left",(e.pageX + xOffset + $("#cardPreviewContent").height()) + "px")
          .fadeIn("fast");
      }, 200);
    },
    function(){
      $("#cardPreviewContent").remove();
    });
    $("a.cardPreviewRotate").mousemove(function(e){
      var top = e.pageY;
      if (($(window).scrollTop() + $(window).height()) < (top + $("#cardPreviewContent").width() + yOffset)) {
        top = $(window).scrollTop() + $(window).height() - $("#cardPreviewContent").width() - yOffset;
      }
      $("#cardPreviewContent")
        .css("top",(top) + "px")
        .css("left",(e.pageX + xOffset + $("#cardPreviewContent").height()) + "px");
    });
  }

});


})(jQuery);