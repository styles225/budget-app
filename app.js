var model = (function() {
    var Income, Expense, data;

    Income = function(id,type,desc,val) {
        this.id = id;
        this.type = type;
        this.description = desc;
        this.value = val;
    };

    Expense = function(id,type,desc,val) {
        this.id = id;
        this.type = type;
        this.description = desc;
        this.value = val;
        this.percent = -1;
    };

    Expense.prototype.calcPercent = function() {

        var totalInc;

        // get total inc value
        totalInc = data.total.inc;

        // divide total income value by this value
        if (data.total.inc > 0) {
            this.percent = Math.round(this.value / totalInc * 100);
        } else {
            this.percent = -1;
        }
    };

    data = {
        allItems: {
            inc: [],
            exp: []
        },
        total: {
            inc: 0,
            exp: 0
        },
        budget: 0
    };

    return {
        addItem: function(type,desc,val) {

            var newItem, id;

            // create new id
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }
            
            // create new object--prototype
            if (type === 'exp') {
                newItem = new Expense(id,type,desc,val);

                // calc percentage of exp item
                // newItem.calcPercent();
                console.log(newItem);
            } else {
                newItem = new Income(id,type,desc,val);
            }

            // push to correct array
            data.allItems[type].push(newItem);

            // return value to controller
            return newItem;
        },
        calcBudget: function(type) {

            var i;
            data.total[type] = 0;
            
            if (data.allItems[type].length === 0) {
                // data.total[type].value = -1;
                data.total[type] = -1;
            } else {
                for (i = 0; i < data.allItems[type].length; i++) {
                    data.total[type] += data.allItems[type][i].value;
                }
            }
            data.budget = data.total.inc - data.total.exp;
        },
        getBudget: function() {
            return data;
        }
    }
})();

var view = (function() {
    var DOM;

    DOM = {
        addType: '.add__type',
        addDesc: '.add__description',
        addVal: '.add__value',
        expListID: '#exp-list',
        expListClass: '.expenses__list',
        incListID: '#inc-list',
        incListClass: '.income__list',
        budgetIncVal: '.budget__income--value',
        budgetExpVal: '.budget__expenses--value',
        budgetVal: '.budget__value',
        month: '.budget__title--month',
        addBtn: '.add__btn'
    };

    function setTemplate(selector, templateData) {
        document.querySelector(selector).innerHTML = templateData
    };

    function formatNum(int) {
        return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };


    function compileHandlebars(scriptSelect,htmlSelect,input) {

        var listType, template, context;

        // grab the innerHTML of the handlebars script, which has the handlebar variables
        listType = document.querySelector(scriptSelect).innerHTML;

        // pass the innerHTML w/ handlebar variables into compile script
        template = Handlebars.compile(listType);

        // take the compile handlebars data & define the handlebar variables
        context = template({
            id: input.id,
            type: input.type,
            description: input.description,
            value: formatNum(input.value),
            percent: input.percent
        });
        // if (input.type === 'exp') {

        //     context = template({
        //         id: input.id,
        //         type: input.type,
        //         description: input.description,
        //         value: formatNum(input.value),
        //         percent: input.percent
        //     });
        // } else {
        //     context = template({
        //         id: input.id,
        //         type: input.type,
        //         description: input.description,
        //         value: formatNum(input.value)
        //     });
        // }

        // add the expense item to the list
        document.querySelector(htmlSelect).innerHTML += context;
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOM.addType).value,
                description: document.querySelector(DOM.addDesc).value,
                value: parseFloat(document.querySelector(DOM.addVal).value),
            }
        },
        addListItem: function(input) {

            if (input.type === 'exp') {
                compileHandlebars(DOM.expListID,DOM.expListClass,input);
            } else {
                compileHandlebars(DOM.incListID,DOM.incListClass,input);
            }
        },
        displayBudget: function(totals) {

            var inc, exp, tot, totString, negTot;
            inc = totals.total.inc;
            exp = totals.total.exp;
            tot = totals.budget;
            totString = formatNum(tot);

            document.querySelector(DOM.budgetIncVal).innerText = `$ ${formatNum(inc)}`;
            document.querySelector(DOM.budgetExpVal).innerText = `$ ${formatNum(exp)}`;

            if (tot > 0) {
                document.querySelector(DOM.budgetVal).innerText = `+ $${totString}`;
            } else if (tot < 0) {
                negTot = formatNum(Math.abs(tot));
                document.querySelector(DOM.budgetVal).innerText = `- $${negTot}`;
            } else {
                document.querySelector(DOM.budgetVal).innerText = `$${tot}`;
            }
        },
        displayMonth: function() {
            var today = new Date();
            var month = today.toLocaleString('default', { month: 'long' });

            document.querySelector(DOM.month).innerText = month;
        },
        clearInput: function() {
            document.querySelector(DOM.addDesc).value = "";
            document.querySelector(DOM.addVal).value = "";
            document.querySelector(DOM.addDesc).focus();
        },
        getDOM: function() {
            return DOM;
        }
    }
})();

var controller = (function(m,v) {

    // get DOM strings from view module
    var DOMstrings = v.getDOM();

    function init() {

        // get zero values from data structure
        var x = m.getBudget();

        // set everything in UI to zero
        v.displayBudget(x);

        // display month
        v.displayMonth();
    }
    
    // set up event listeners
    document.querySelector(DOMstrings.addBtn).addEventListener('click', function() {
        ctrlAddItem();
    });
    window.addEventListener('keypress', function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            ctrlAddItem();
        }
    });

    function ctrlAddItem() {
        var input, data, totals;
        
        // get input
        input = v.getInput();
        if ((input.description !== "") && (input.value > 0)) {
    
            // add item to data structure
            data = m.addItem(input.type,input.description,input.value);
            console.log(data);

            // add new item to UI
            v.addListItem(data);

            // calculate budget
            m.calcBudget(input.type);

            // retrieve updated values
            totals = m.getBudget();

            // update budget UI
            v.displayBudget(totals);

            // clear input fields
            v.clearInput();
        }
    }
    init();
})(model, view);