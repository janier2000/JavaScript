

const energyLevels = [100, 200, 300, 400, 500];
const result = energyLevels
    .map((item, index, array) => {
       
        console.log(item, index, array);
        const isLastElem = index == array.length - 1;
        const nextElemnt = isLastElem ? array[0]: array[index + 1];
        return item + nextElemnt;
    });

console.log(result);

debugger

const arr = [1, 2, 3, 4, 5];
const newArr = arr.map(item => item * 2);


const peliculas = [
    { titulo: "Inception", año: 2010, rating: 8.8, genero: "Sci-Fi" },
    { titulo: "The Dark Knight", año: 2008, rating: 9.0, genero: "Action" },
    { titulo: "Interstellar", año: 2014, rating: 8.6, genero: "Sci-Fi" },
    { titulo: "Memento", año: 2000, rating: 7.4, genero: "Thriller" },
    { titulo: "Dunkirk", año: 2017, rating: 5.8, genero: "War" },
    { titulo: "Tenet", año: 2020, rating: 2.3, genero: "Sci-Fi" },
];

const res1= peliculas.map(p => ({ ...p, starts: "*".repeat(Math.round(p.rating)) }))
const res2 = peliculas.map(p => ({ ...p, starts: "*".repeat(Math.round(p.rating)) })).filter(p => p.rating > 7)
debugger

const res3 = peliculas.map(p => ({ ...p, starts: "*".repeat(Math.round(p.rating))}))
    .filter(p => p.rating > 7)
    .reduce((acc, p) => {
        acc[p.genero] = acc[p.genero] || [];
        acc[p.genero].push(p)
        return acc;
    }, {})

