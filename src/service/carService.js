const BaseRepository = require('./../repository/base/baseRepository')
const Tax = require('./../entities/tax')

//criação da classe

class CarService {
    constructor({cars}) {
        this.carRepository = new BaseRepository({ file:cars })
        this.taxesBasedOnAge = Tax.taxesBasedOnAge
        //api localization usada ao invés de template string. o indicado seria criar outra classe
        this.currencyFormat = new Intl.NumberFormat('pt-br', {
            style: 'currency',
            currency: 'BRL'
        }).format(244.40)

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

    async calculateFinalPrice(customer, carCategory, numberOfDays) {
        const { age } = customer
        const price = carCategory.price
        const { then } = this.taxesBasedOnAge
            .find(tax => age >= tax.from && age <= tax.to)
            console.log('then', then)
    }
}

module.exports = CarService