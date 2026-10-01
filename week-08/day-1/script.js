const scoreboardLink = document.querySelector('.score-link');

if (scoreboardLink) {
  const doodleLink = document.createElement('a');
  doodleLink.className = 'score-link doodle-link';
  doodleLink.href = 'https://www.google.com/doodles/fourth-of-july-2019';
  doodleLink.target = '_blank';
  doodleLink.rel = 'noopener noreferrer';
  doodleLink.textContent = "Play Google's baseball doodle ↗";
  scoreboardLink.insertAdjacentElement('afterend', doodleLink);
}
