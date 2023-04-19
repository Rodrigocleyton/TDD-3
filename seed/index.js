const faker = require('faker')
const Car = require("./../src/entities/car")
const CarCategory = require("./../src/entities/carCategory")
const Customer = require("./../src/entities/customer")

const { join } = require('path')
const { writeFile } = require('fs/promises')

//é onde serão salvos os datos gerados
const seederBaseFolder = join(__dirname, "../", "database")
const ITENS_AMOUNT = 2

const carCategory = new CarCategory({
    id: faker.datatype.uuid(),
    name: faker.vehicle.type(),
    carIds: [],
    price: faker.finance.amount(20,100)
})
//o resultado do for será salvo nesse array
const cars= []
const customers = []

for(let index = 0; index <= ITENS_AMOUNT; index++ ) {
    const car = new Car({
        id: faker.datatype.uuid(),
        name: faker.vehicle.model(),
        available: true,
        gasAvailable: true,
        releaserYear: faker.date.past().getFullYear()
    })
    //pega o id do carro criado o coloca no array
    carCategory.carIds.push(car.id)
    cars.push(car)

    const customer = new Customer({
        id: faker.datatype.uuid(),
        name: faker.name.findName(),
        age: faker.datatype.number({min: 18 , max: 50})

    })
    customers.push(customer)
}

//recebe um filename e os dados. seederBase é o "BD"
const write = (filename, data ) => writeFile(join(seederBaseFolder, filename), 
JSON.stringify(data))


;(async () =>{
    await write('cars.json', cars)
    await write('customers.json', customers)
    await write('carCategory.json', [carCategory])

    console.log('cars', cars)
    console.log('customers', customers)
    console.log('carCategory', carCategory)//ou car?

})()

/*
console.log({
    id: faker.random.uuid(),
    name: faker.name.firstName()
})
*/