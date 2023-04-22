const { describe, it, before, beforeEach, afterEach } = require('mocha')
const CarService = require('./../../src/service/carService')

const  { join } = require('path')
//não se assert em BDD, EM BDD é tudo mais semântico, falado, para que qualquer pessoa possa entender a regra de negócio com mais facilidade
//const assert = require('assert')
const { expect } = require('chai')//dentro dele vem o expert e outros módulos para asserssão. Padrão BDD

const sinon = require('sinon')
const Transaction = require('./../../src/entities/transaction')

//busca dentro da pasta database
const carsDatabase = join(__dirname, './../../database', "cars.json")

const mocks = {
    validCarCategory: require('./../mocks/valid-carCategory.json'),
    validCar: require('./../mocks/valid-car.json'),
    validCustomer: require('./../mocks/valid-customer.json')
}

//suite de testes
describe('carService Suite Tests', () => {
    let carService = {}
    let sandbox = {}
    //usando o before antes de rodar qualquer teste o service será iniciado
    before(()=> {
        carService = new CarService({
            //enviado como injeção de dependência para dentro de carService
            // a partir disso a service vai delegar pra repository, e a repository vai ler o arquivo de dentro do json
            cars: carsDatabase
        })
    })

    //cria um sandbox para que cada teste que rodar, ele limpe todas as instâncias para garantir que nenhuma instância seja corrompida durante a execução
    //antes de cada it cria uma instãncia vazia do sinon
    beforeEach(() =>{
        sandbox = sinon.createSandbox()
    })
    //depois de cada item que mudarem o objeto será resetado
    afterEach(()=>{
        sandbox.restore()
    })

    it('should retrieve a random position from an array' , () => {
        const data = [0, 1, 2, 3, 4]
        const result = carService.getRandomPositionFromArray(data)
        //é esperado um valor menor do que o data.length e precisa ser maior ou igual a  0
        expect(result).to.be.lte(data.length).and.be.gte(0)
    })

    it('should choose the first id from de carId in carCategory', () => {
        const carCategory = mocks.validCarCategory
        const carIndex = 0//para pegar sempre o primeiro carro

        sandbox.stub(
            carService,
            carService.getRandomPositionFromArray.name
        ).returns(carIndex)//quando chamar retornará 0

        const result = carService.chooseRandomCar(carCategory)
        const expected = carCategory.carIds[carIndex]//espera que pegar o id 0
        
        //verifica se getRandomPosition foi chamado apenas 1 vez
        expect(carService.getRandomPositionFromArray.calledOnce).to.be.ok
        expect(result).to.be.equal(expected)//BDD

    })
    
    //deverá retornar um carro disponível
    it('given a carCategory it should return an available car ', async () => {
        const car = mocks.validCar
        //cria uma instância imutável para não afetar os outros testes, não vai modificar o objeto pai
        const carCategory = Object.create(mocks.validCarCategory)
        carCategory.carIds = [car.id]

        //para não precisar de serviços externos para validar
        sandbox.stub(
            carService.carRepository,
            carService.carRepository.find.name//.name retorna o nome da função
        ).resolves(car)

        //confere se a função foi chamada conforme o esperado
        sandbox.spy(
            carService,
            carService.chooseRandomCar.name
        )

        const customer = mocks.validCustomer

        const result = await carService.getAvailableCar(carCategory)
        const expected = car

        //assert.deepStrictEqual(result, expected)
        //console.log('result', result)
        expect(carService.chooseRandomCar.calledOnce).to.be.ok
        expect(carService.carRepository.find.calledWithExactly(car.id)).to.be.ok
        expect(result).to.be.deep.equal(expected)
    })

    it('give a carCategory, customer ande numberOfDays it should calculate final amount in real', async () => {
        const customer = Object.create(mocks.validCustomer)//evita que seja alterado o valor  de mocks
        customer.age = 50

        const carCategory = Object.create(mocks.validCarCategory)
        carCategory.price = 37.6
        const numberOfDays = 5

        //não depender de dados externos
        sandbox.stub(
            carService,
            "taxesBasedOnAge"//para propiedades não coloca o .name mas caso altere, não esquecer de alterar em tudo
            //caso alguém tente alterar o valor, retornará com esses dados fixos
        ).get(() => [{ from: 40, to:50, then: 1.3 }])
        
        const expected = carService.currencyFormat.format(244.40)
        //console.log('expected', expected)
        const result = carService.calculateFinalPrice(
            customer,
            carCategory,
            numberOfDays
        )

        expect(result).to.be.equal(expected)

    })

    it('given a customer and a car category it should return a transaction receipt', async () => {
        const car = mocks.validCar
        const carCategory = {
            //rest spread , recebe todas as propiedades que estão no mocks pelos valores abaixo. Cria um objeto novo sem sujar os mocks. Usado quando tem mais de um objeto
            ...mocks.validCarCategory,
            price: 37.6,
            carIds: [car.id]
        }

        const customer = Object.create(mocks.validCustomer)
        customer.age = 20

        const numberOfDays = 5

        const dueDate = "10 de Novembro de 2020"

        const now = new Date(2020, 10, 5)
        sandbox.useFakeTimers(now.getTime())// moca uma data
       // console.log("now 01", now)
        //console.log("now 02", new Date())
        //age: 20, taxi:1.1, categoryPrice: 37.6
        //37.6 * 1.1 = 41.36 * 5 days = 206.8
        
        sandbox.stub(
            carService.carRepository,
            carService.carRepository.find.name,
        ).resolves(car)


        const expectedAmount = carService.currencyFormat.format(206.80)

        const result = await carService.rent(
            customer, carCategory, numberOfDays
        )
       
        const expected = new Transaction({
            customer,
            car,
            dueDate,
            amount: expectedAmount,

        })

        expect(result).to.be.deep.equal(expected)

        //api de data do JS
        /*
        const today = new Date()
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
        console.log('today', today.toLocaleDateString("pt-br", options))
        */
    })
    
})