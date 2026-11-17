const shots = [
  ['4', 'Тот самый созвон', 'Улыбка перед микрофоном'],
  ['chicken', 'Когда попросили улыбнуться', 'Курица с широкой зубастой улыбкой'],
  ['2', 'Предельно серьёзно', 'Портрет с нахмуренными бровями'],
  ['1', 'Селфи без подготовки', 'Селфи крупным планом'],
  ['5', 'Алло, меня слышно?', 'Кадр с веб-камеры в наушниках'],
  ['3', 'Мем из переписки', 'Мужчина в костюме за столом']
];
const element = id => document.getElementById(id);
const dialog = document.querySelector('dialog');
const photo = element('big');
let current = -1;
function show(index) {
  current = (index + shots.length) % shots.length;
  const [file, title, description] = shots[current];
  photo.src = 'media/' + file + '.png';
  photo.alt = description;
  element('caption').textContent = title;
  element('count').textContent = 'Кадр 0' + (current + 1) + ' / 0' + shots.length;
  if (!dialog.open) dialog.showModal();
}
shots.forEach(([file, title], index) => {
  const card = document.createElement('button');
  card.className = 'card';
  card.innerHTML = '<span class="frame"><img loading="lazy" src="media/' + file + '.png" alt=""><span class="number">0' + (index + 1) + '</span></span><span class="line">' + title + '<b aria-hidden="true">↗</b></span>';
  card.onclick = () => show(index);
  element('grid').append(card);
});
document.querySelectorAll('[data-file]').forEach(button => {
  button.onclick = () => show(shots.findIndex(([file]) => file === button.dataset.file));
});
element('shuffle').onclick = () => {
  if (current < 0) show(Math.floor(Math.random() * shots.length));
  else show(current + 1 + Math.floor(Math.random() * (shots.length - 1)));
};
element('close').onclick = () => dialog.close();
element('prev').onclick = () => show(current - 1);
element('next').onclick = () => show(current + 1);
dialog.onkeydown = event => {
  if (event.key === 'ArrowRight') show(current + 1);
  if (event.key === 'ArrowLeft') show(current - 1);
};
dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
let start;
photo.ontouchstart = event => {
  start = event.touches.length === 1 ? event.touches[0] : null;
};
photo.ontouchcancel = () => { start = null; };
photo.ontouchend = event => {
  if (!start) return;
  const dx = event.changedTouches[0].clientX - start.clientX;
  const dy = event.changedTouches[0].clientY - start.clientY;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
  start = null;
};

const pages = ['profile', 'photos', 'video'];
function selectPage() {
  const hash = location.hash.slice(1);
  const active = pages.includes(hash) ? hash : 'profile';
  pages.forEach(id => { element(id).hidden = active !== id; });
  element('comments').hidden = active !== 'profile';
  if (active !== 'video') document.querySelector('video').pause();
  document.querySelectorAll('nav a').forEach(link => {
    if (link.hash === '#' + (hash === 'comments' ? hash : active)) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  if (hash === 'comments') element('comments').scrollIntoView();
}
window.addEventListener('hashchange', selectPage);
selectPage();

const storageKey = 'sasha.archive.comments';
let comments = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(saved)) comments = saved.filter(entry => typeof entry === 'string');
} catch {}
function renderComments() {
  element('total').textContent = comments.length;
  element('entries').replaceChildren(...comments.map(message => {
    const entry = document.createElement('li');
    entry.textContent = message;
    return entry;
  }));
  if (comments.length) element('note').textContent = 'Комментарии сохраняются в этом браузере.';
}
renderComments();
element('comment-form').onsubmit = event => {
  event.preventDefault();
  const message = element('message').value.trim();
  if (!message) return;
  comments.push(message);
  renderComments();
  try {localStorage.setItem(storageKey, JSON.stringify(comments));}
  catch {element('note').textContent = 'Запись доступна до закрытия страницы.';}
  event.target.reset();
};
