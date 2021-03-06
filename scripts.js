const Modal = {
    open() {
        //Abrir Modal -> Adiciona Class Active ao modal
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        //Fecha o Modal -> Retira Class active
        document.querySelector('.modal-overlay').classList.remove('active');
        // Ao Invés de usar dois métodos, pode-se usar a função toggle
    }
}

const StorageItens = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}


const Transaction = {
    all: StorageItens.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes() {
        let income = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },

    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense

    },
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSClass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `        
            <td class="description">${transaction.description}</td>
            <td class="${CSSClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td> <img onclick='Transaction.remove(${index})' src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `
        return html
    },

    updateBalance() {
        document.querySelector('#incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())

        document.querySelector('#expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())

        document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = ''
    }

}

const Utils = {
    formatAmount(value) {
        /* value = Number(value.replace(/\,\./g,"")) * 100
        Deveria ser : 
        value = Number(value.replace(/\,?\.?/g,"")) * 100
        Mas como o input [type=number] já traz o dado em formato de número, por isso uma forma melhor de fazer esta operação é usar Math.round(), como abaixo:
        */
       value = value * 100
       return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`

    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, "")
        //Esta expressão regular /\D/g retira todo caractere que não seja número e o 'g' no final é para fazer a busca de forma global, ou seja, não apenas na primeira ocorrẽncia //

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: Form.amount.value,
            date: this.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === '' ||
            amount.trim() === '' ||
            date.trim() === '') {
            throw new Error('Por favor preencha todos os campos!')
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event) {
        //Previnir comportamento padrão de enviar os dados na URL
        event.preventDefault()

        try {
            //Verificar se os campos estão preenchidos
            this.validateFields()

            //Formatar os dados para salvar
            const transaction = this.formatValues()

            //salvar os dados
            Transaction.add(transaction)

            //apagar os dados do form
            this.clearFields()

            //fechar Modal
            Modal.close()

            //Reload no app - já temos no Transaction.add()


        } catch (error) {
            alert(error.message)
        }

    }
}


const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        //Transaction.all.forEach(DOM.addTransaction)        
        DOM.updateBalance()

        StorageItens.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        this.init()
    }
}

App.init()