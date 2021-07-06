// ==UserScript==
// @name         TeamMod
// @description  Enables moderation tools in private teams.
// @author       @Ano
// @version      1.0.0-alpha
// @run-at document-end
//
// @include      https://stackoverflow.com/c/*
//
// @exclude      *chat.*
// @exclude      *blog.*
//
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @require      https://raw.githubusercontent.com/samliew/SO-mod-userscripts/master/lib/common.js
// ==/UserScript==

$(document).ready(function() {
  'use strict';
  var teamName = /^\/c\/([a-z0-9\-]+)(?:\/.*?)?$/.exec(window.location.pathname);
  if(teamName) {
    teamName = teamName[1];
  }
  else {
    return;
  }

  var StackExchange = unsafeWindow.StackExchange;

  // Add the flag button
  (function() {
      'use strict';

      $(`<div class="grid--cell">
    <button type="button" class="js-flag-post-link s-btn s-btn__link js-gps-track" data-gps-track="post.click({ item: 5, priv: 27, post_type: 1 })" title="Flag this post for serious problems or moderator attention">
        Flag
    </button>
</div>`).appendTo($(".js-post-menu").children().filter(".gs8"));
  $(".js-comment-actions").append(`<div class="comment-flagging js-comment-edit-hide">
    <button class="js-comment-flag s-btn s-btn__unset bg-transparent c-pointer fc-black-100 h:fc-red-500" aria-label="Flag Comment" aria-pressed="false" title="Flag this comment for serious problems or moderator attention">
        <svg aria-hidden="true" class="svg-icon iconFlag" width="18" height="18" viewBox="0 0 18 18"><path d="M3 2v14h2v-6h3.6l.4 1h6V3H9.5L9 2H3z"></path></svg>
    </button>
</div>`);
  })();

  $($("a").filter(function() {
    if($(this).attr("href") == "/annotated-posts" || /(?<=^\/admin\/)(.+)(?=$)/.test($(this).attr("href"))) {
    return this;
  }
    })).each(function(index, link) {
        $(link).attr("href", `/c/${teamName}${$(link).attr("href")}`);
    });

  // At this point, you need to be an admin to use any of the other features
  if(StackExchange.moderator === undefined) return; // If you're not, end the script here

  var userID = /^\/c\/[a-z\d\-]+\/users\/(\d+)\/?(?:\?.*)?$/.exec(window.location.pathname); // If the current page is a user profile page, get the ID
  if(userID) {
    userID = userID[1];
  }

  if(userID) { // Are we on a user profile page?
    $('.js-user-header > .grid--cell:contains("Network profile")').after(`<div class="grid--cell ml12 ai-center">
  <a class="grid--cell ws-nowrap js-mod-menu-button" href="#" role="button" data-controller="se-mod-button" data-se-mod-button-type="user" data-se-mod-button-id="${userID}">Mod</a>
</div>`); // If so, add the user moderator actions button
  }

  $(".js-post-menu > .grid").each(function(index, element) { // Add post moderation actions dialog
    $(element).append(`<div class="grid--cell">
  <button type="button" class="js-mod-menu-button s-btn s-btn__link js-gps-track" data-gps-track="post.click({ item: 11, priv: 17, post_type: 1 })" data-controller="se-mod-button" data-se-mod-button-type="post" data-se-mod-button-id="${$(element).parent().attr("data-post-id")}">Mod</button>
</div>`);
  });

  StackExchange.ready(StackExchange.moderator.init); // Re-initialize Stack Exchange so it can adjust to the new button(s)

  $(".js-profile-mod-info").removeClass("d-none"); // Show moderation info on users

  $('#left-sidebar > div > nav > .nav-links > li > a:contains("Admin settings")').parent().after(`<li class="">
    <a href="${StackExchange.options.site.routePrefix}/admin/links" class="pl8 js-gps-track nav-links--link" aria-controls="" data-controller="" data-s-popover-placement="right" id="moderator-tools-link">
            <div class="grid ai-center">
                <div class="grid--cell truncate">
                    Moderator tools
                </div>
            </div>
    </a>
</li>`);

  jQuery.get("https://stackoverflow.com/c/the-friendly-cafe/admin/dashboard", function(response) {
    var elements = $('<div id="moderatorTools">').html(response);
      var currentModeratorAlerts = Number(elements.find("[title=\"summary of current moderator alerts\"]:first > .s-badge").text());
      if(currentModeratorAlerts) {
        $('#left-sidebar > div > nav > .nav-links > li > a:contains("Moderator tools") > .grid > .grid--cell:first').after(`<div class="grid--cell px4 ml-auto">
    <span class="s-badge s-badge__sm bg-blue-600 fc-white bc-transparent" title="Summary of current moderator alerts">${currentModeratorAlerts}</span>
</div>`);
      }
  });
});
