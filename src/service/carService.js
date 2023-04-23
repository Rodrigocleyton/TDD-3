const BaseRepository = require('./../repository/base/baseRepository')
const Tax = require('./../entities/tax')
 const Transaction = require('./../entities/transaction')

//criação da classe

class CarService {
    constructor({ cars }) {
        this.carRepository = new BaseRepository({ file: cars })
        this.taxesBasedOnAge = Tax.taxesBasedOnAge
        //api localization usada ao invés de template string. o indicado seria criar outra classe
        this.currencyFormat = new Intl.NumberFormat('pt-br', {
            style: 'currency',
            currency: 'BRL'
        })
    }
    /*
    test(id){       
        return this.carRepository.find(id)
    }
    */
    //recebe uma lista como parâmetro
    getRandomPositionFromArray(list) {
        //pega o tamanho da lista
        const listLength = list.length
        //faz o arrendodamento do que vem randomicamente
        return Math.floor(
            Math.random() * (listLength)
        )
    }

    chooseRandomCar(carCategory) {
        const randomCarIndex = this.getRandomPositionFromArray(carCategory.carIds)
        //peaga o indice
        const carId = carCategory.carIds[randomCarIndex]//o car selecionado será o index que retornou dessa função
        return carId
    }
    async getAvailableCar(carCategory) {
        //escolhe um carro dinamicamente
        const carId = this.chooseRandomCar(carCategory)
        const car = await this.carRepository.find(carId)

        return car
    }

     calculateFinalPrice(customer, carCategory, numberOfDays) {
        const { age } = customer
        const price = carCategory.price
        const { then: tax } = this.taxesBasedOnAge
            .find(tax => age >= tax.from && age <= tax.to)

        const finalPrice = ((tax * price) * (numberOfDays))
        const formattedPrice = this.currencyFormat.format(finalPrice)

        return formattedPrice
    }

    async rent(
        customer, carCategory, numberOfDays
    ) {
        //pega um carro disponível a partir da categoria
        const car = await this.getAvailableCar(carCategory)
        //preço final para o cliente
        const finalPrice = await this.calculateFinalPrice(customer, carCategory, numberOfDays)

        const today = new Date()
        today.setDate(today.getDate() + numberOfDays)
        const options = { year: "numeric", month: "long", day: "numeric"}
        const dueDate = today.toLocaleDateString("pt-br", options)

        const transaction = new Transaction({
            customer,
            dueDate,
            car,
            amount: finalPrice
        })
        //console.log('transaction', transaction)
        return transaction;
    }
    
}

module.exports = CarService