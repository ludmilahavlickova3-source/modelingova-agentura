/* Revelation Models — page.js
   Malý skript pro podstránky (Služby, Jak se stát modelkou): horní lišta, mobilní menu, sdílení, rok v patičce. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var header = $('#site-header');
  var TOP = ['bg-[#0a0a0a]/40', 'backdrop-blur-sm', 'py-5'];
  var SCROLLED = ['bg-[#0a0a0a]/95', 'backdrop-blur-md', 'py-4', 'shadow-lg', 'shadow-black/50'];
  var scrolled = false;
  function onScroll() {
    var s = window.scrollY > 60;
    if (s === scrolled) return;
    scrolled = s;
    TOP.forEach(function (c) { header.classList.toggle(c, !s); });
    SCROLLED.forEach(function (c) { header.classList.toggle(c, s); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menu = $('#mobile-menu'), openBtn = $('#menu-open');
  function setMenu(open) {
    menu.classList.toggle('translate-x-0', open);
    menu.classList.toggle('translate-x-full', !open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menu.inert = !open;
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) $('#menu-close').focus();
  }
  openBtn.addEventListener('click', function () { setMenu(true); });
  $('#menu-close').addEventListener('click', function () { setMenu(false); openBtn.focus(); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('translate-x-0')) { setMenu(false); openBtn.focus(); }
  });

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  if (navigator.share) {
    var canon = $('link[rel="canonical"]');
    Array.prototype.forEach.call(document.querySelectorAll('[data-native-share]'), function (b) {
      b.hidden = false; b.classList.add('flex');
      b.addEventListener('click', function () {
        navigator.share({ title: document.title, url: canon ? canon.href : location.href }).catch(function () {});
      });
    });
  }
})();
