//Está camada faz a troca de informações com o BD
const { readFile} = require("fs/promises")
class BaseRepository {
    constructor({file}) {
        this.file = file
    }
    async find(itemId){
        const content = JSON.parse( await readFile(this.file))
        if(!itemId) return content // senão foi passado id para filtrar vai retornar o arquivo inteiro

        //se passaram, será filtrado por id quem tem o id igual ao que foi passado
        return content.find(({id})=> id === itemId) 
    }
}

module.exports = BaseRepository