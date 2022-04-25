// ==UserScript==
// @name         TeamMod
// @description  Enables moderation tools in private teams.
// @author       @Ano
// @version      1.1.2-alpha
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

      $(`<div class="flex--item">
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

  var userID = /^\/c\/[a-z\d\-]+\/users\/(?:edit\/)?((?:\d|\-)+)\/?(?:\?.*)?$/.exec(window.location.pathname); // If the current page is a user profile page, get the ID
  if(userID) {
    userID = userID[1];
  }

  if(userID) { // Are we on a user profile page?
    $('.js-user-header').each(function(index, header) {
      function getClasses() {
        return "";
      }
      var channelClass = $(".top-bar").attr("class").split(/\s+/).find(className => /channel(\d+)/.test(className)); // get the channel's class for the team-specific color
      $(header).html(`<div class="flex--item s-navigation">

<a href="/c/${teamName}/users/${userID}/?tab=profile" class="s-navigation--item${$(`.js-user-header > .flex--item > [href="/c/${teamName}/users/${userID}/?tab=profile"]`).hasClass("is-selected") ? ` is-selected ${channelClass} themed-bg`: ""}" data-shortcut="P">Profile</a>
<a href="/c/${teamName}/users/${userID}/?tab=topactivity" class="s-navigation--item${$(`.js-user-header > .flex--item > [href="/c/${teamName}/users/${userID}/?tab=topactivity"]`).hasClass("is-selected") ? ` is-selected ${channelClass} themed-bg`: ""}" data-shortcut="A">Activity</a>
<a href="/c/${teamName}/users/account-info/${userID}"
class="s-navigation--item${(window.location.pathname == `/c/${teamName}/users/account-info/${userID}` || window.location.pathname == `/c/${teamName}/users/account-info/${userID}/`) ? ` is-selected ${channelClass} themed-bg`: ""}"
data-shortcut="M">Mod dashboard</a>
<a href="/c/${teamName}/users/edit/${userID}" class="s-navigation--item${(window.location.pathname == `/c/${teamName}/users/edit/${userID}` || window.location.pathname == `/c/${teamName}/users/edit/${userID}/`) ? ` is-selected ${channelClass} themed-bg`: ""}" data-shortcut="E">Edit profile and settings</a>
</div>
<div class="flex--item ml-auto">
<div class="d-flex ai-center gs12 gsx">
<a href="#" class="flex--item ws-nowrap account-toggle">Account info</a>
<a class="flex--item ws-nowrap js-mod-menu-button" href="#" role="button" data-controller="se-mod-button" data-se-mod-button-type="user" data-se-mod-button-id="${userID}">Mod</a>
<a href="${$(header).children().filter(":contains(\"Network profile\")").children().children().filter("a").attr("href")}" class="flex--item ws-nowrap">
<svg aria-hidden="true" class="native svg-icon iconLogoSEXxs" width="18" height="18" viewBox="0 0 18 18"><path d="M3 4c0-1.1.9-2 2-2h8a2 2 0 012 2H3z" fill="#8FD8F7"/><path d="M15 11H3c0 1.1.9 2 2 2h5v3l3-3a2 2 0 002-2z" fill="#155397"/><path fill="#46A2D9" d="M3 5h12v2H3z"/><path fill="#2D6DB5" d="M3 8h12v2H3z"/></svg>
Network profile
</a>
${$(".mod-tabs").parent().html()}
</div>`); // If so, add the user moderator actions button
      $(`.js-user-header > .flex--item > [href="/c/${teamName}/users/account-info/${userID}"], .account-toggle`).on("click", function() { // Stack Exchange 404'ed this page (makes sense, with all the PII).  Sorry.
        alert("This is not available in private teams.");
        return false;
      });
    });

  }

  $(".js-post-menu > .gs8").each(function(index, element) { // Add post moderation actions dialog
    $(element).prepend(`<div class="flex--item">
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

  jQuery.get(`https://stackoverflow.com/c/${teamName}/admin/dashboard`, function(response) {
    var elements = $('<div id="moderatorTools">').html(response);
      var currentModeratorAlerts = Number(elements.find("[title=\"summary of current moderator alerts\"]:first > .s-badge").text());
      if(currentModeratorAlerts) {
        $('#left-sidebar > div > nav > .nav-links > li > a:contains("Moderator tools") > .grid > .grid--cell:first').after(`<div class="grid--cell px4 ml-auto">
    <span class="s-badge s-badge__sm bg-blue-600 fc-white bc-transparent" title="Summary of current moderator alerts">${currentModeratorAlerts}</span>
</div>`);
      }
  });
});
