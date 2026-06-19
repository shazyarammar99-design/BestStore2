const u = 'https://www.youtube.com/watch?v=O-NBEY9NUAs'; 
const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/); 
console.log(m ? `https://www.youtube.com/embed/${m[1]}` : 'fail');
