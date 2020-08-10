'use strict';
(function () {
  var button = document.createElement('button');
')';
  function setBackgroundImage() {
    if (document.body.classList.contains('spimosim-dark')) {
      button.style.backgroundImage = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzgiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDQuMjMzMzMzMiA0LjIzMzMzMzUiCiAgIGhlaWdodD0iMTYiCiAgIHdpZHRoPSIxNiI+CiAgPGRlZnMKICAgICBpZD0iZGVmczIiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC0yOTIuNzY2NjUpIgogICAgIGlkPSJsYXllcjEiPgogICAgPGNpcmNsZQogICAgICAgcj0iMS41ODc1IgogICAgICAgY3k9IjI5NC44ODMzMyIKICAgICAgIGN4PSIyLjExNjY2NjYiCiAgICAgICBpZD0icGF0aDE0MTgiCiAgICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6I2ZmZmYwMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4xNDExMTExMTtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2UtZGFzaG9mZnNldDowO3N0cm9rZS1vcGFjaXR5OjEiIC8+CiAgICA8Y2lyY2xlCiAgICAgICByPSIxLjk4NDM3NSIKICAgICAgIGN5PSIyOTQuODgzMzMiCiAgICAgICBjeD0iMi4xMTY2NjY2IgogICAgICAgaWQ9InBhdGgxNDIwIgogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiNmZmZmMDA7c3Ryb2tlLXdpZHRoOjAuMjU5MjkxNjc7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5OjAuMjU5MjkxNjcsMC4yNTkyOTE2NztzdHJva2UtZGFzaG9mZnNldDowO3N0cm9rZS1vcGFjaXR5OjEiIC8+CiAgPC9nPgo8L3N2Zz4K')";
    } else {
      button.style.backgroundImage = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzgiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDQuMjMzMzMzMiA0LjIzMzMzMzUiCiAgIGhlaWdodD0iMTYiCiAgIHdpZHRoPSIxNiI+CiAgPGRlZnMKICAgICBpZD0iZGVmczIiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC0yOTIuNzY2NjUpIgogICAgIGlkPSJsYXllcjEiPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoODE3IgogICAgICAgZD0ibSAzLjQxMzEwMTgsMjk1LjgyMjcxIGMgMC41OTkxODY0LC0xLjAzNzgyIDAuMjQzNTk2NSwtMi4zNjQ4OCAtMC43OTQyMjgxLC0yLjk2NDA3IDAuNDQ0Nzg1MiwwLjI1NjggMC42ODg1MDg1LDEuNTE5MjcgMC4wODkzMjEsMi41NTcxMSAtMC41OTkxODkyLDEuMDM3ODEgLTEuODE0Mzg1NjEsMS40NTc5OCAtMi4yNTkxNjQ2MSwxLjIwMTE4IDEuMDM3ODE4MzEsMC41OTkxOSAyLjM2NDg3NDgxLDAuMjQzNjEgMi45NjQwNzE3MSwtMC43OTQyMiB6IgogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOiNmZmZmMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMTY1MzIyMTQ7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLWRhc2hvZmZzZXQ6MDtzdHJva2Utb3BhY2l0eToxIiAvPgogIDwvZz4KPC9zdmc+Cg==')";
    }
  }
  button.className = 'spimosim-dark-switch';
  button.textContent = '';
  button.style.width = '2rem';
  button.style.height = '2rem';
  button.style.zIndex = 10;
  button.style.padding = '0';
  button.style.margin = '0';
  button.style.position = 'absolute';
  button.style.top = '.3rem';
  button.style.right = '.3rem';
  button.style.backgroundSize = '70%';
  button.style.backgroundPosition = 'center';
  button.style.backgroundRepeat = 'no-repeat';
  setBackgroundImage();
  
  button.addEventListener('click',
    function () {
      document.body.classList.toggle('spimosim-dark');
      spimosimUi.BasicPlotter.generateFallbackColors(document.body);
      setBackgroundImage();
    });

  document.body.appendChild(button);
}());