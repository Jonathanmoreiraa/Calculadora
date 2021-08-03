class CalcController{
    constructor(){
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false; //de inicio está desligado
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonEvents();
        this.initKeyboard();
    
    }
    copyToClipboard(){
        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove(); //remove o input da tela
    }
    pasteFromClipboard(){
        document.addEventListener('paste', e=>{
            let paste = e.clipboardData.getData('Text');
            this.displayCalc = parseFloat(paste);
        });

    }
    initialize(){
        this.setdisplayDateTime()
        setInterval(()=>{
            this.setdisplayDateTime()
        }, 1000); 
        
        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn=>{
           btn.addEventListener('dblclick', e=>{

                this.toggleAudio(); //verifica se o áudio está ligado ou desligado

           }); 
        });
    }
    toggleAudio(){
        if(this._audioOnOff){
            this._audioOnOff = false;
        }else{
            this._audioOnOff = true;
        }

        //UMA FORMA MAIS SIMPLES DE FAZER O IF E ELSE
        //this._audioOnOff = (this._audioOnOff) ? false : true;

        //Por ser booleano ainda existe outra forma
        //this._audioOnOff = !this._audioOnOff;

    }
    playAudio(){
        if (this._audioOnOff){
            this._audio.currentTime = 0; //sempre toca o audio do inicio
            this._audio.play();
        }
    }
    initKeyboard(){
        document.addEventListener('keyup', e=>{ 
            this.playAudio();
            switch (e.key){
                case 'Delete':
                    this.clearAll()
                    break;
                case 'Backspace':
                    this.clearEntry()
                    break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key); //adiciona a tecla que o suáro digitou
                    break;
                //o usuário pode digitar enter ou = que dará o resultado da mesma forma
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot('.');
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(e.key);
                    break;
                case 'c':
                    if (e.ctrlKey) this.copyToClipboard(); //verifica se o ctrl foi selecionado ao copiar.
                    break;
            }
        }); //keyup captura a tecla na hr que ela é pressionada
    }
    addEventListenerAll(element,events, fn){
        events.split(' ').forEach(event=>{
            element.addEventListener(event, fn, false)
        })
    }
    clearAll(){
        this._operation = [];
        this._lastNumber = ''; //limpa o último número
        this._lastOperator = ''; //limpa o último operador

        this.setLastNumberToDisplay();
    }
    clearEntry(){
        this._operation.pop()

        this.setLastNumberToDisplay();

    }
    getLastOperation(){
        return this._operation[this._operation.length-1];
    }
    setLastoperation(value){
        this._operation[this._operation.length-1] = value;//entra na última posição do array
    }
    isOperator(value){
        return (['+','-','*','/','%'].indexOf(value)>-1)//retorna o valor, desde que seja maior que um

    }
    pushOperation(value){
        this._operation.push(value);
        if (this._operation.length > 3){
            this.calc()
        }

    }
    getResult(){
        try{
            return eval(this._operation.join(""));
        }catch(e){
            setTimeout(()=>{
                this.setError();
            },0) //espera 0 milisegundos para fazer essa ação dento das chaves.
        }
        
    }
    calc(){
        let last = '';
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3){
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length>3){
            last = this._operation.pop(); //retira o ultimo elemento            
            this._lastNumber = this.getResult();//usa os valores digitados e retira as "," usando o join.

        }else if (this._operation.length == 3){
            this._lastNumber = this.getLastItem(false);//guarda o último número
        }
        let result = this.getResult();//usa os valores digitados e retira as "," usando o join.
        if(last=='%'){ //calcula as operações com porcentagem.
            let por = (this._operation[0]*this._operation[2])/100;
            let ult = this._operation[2];
            last = this._operation.pop();
            console.log(this._operation);
            switch (this._operation[1]) {
                case '+':
                    if( this._operation[0]>9){
                        this._operation[0] = parseFloat(this._operation[0])
                    }
                    result =  this._operation[0]+por;
                    break;
                case '-':
                    if( this._operation[0]>9){
                        this._operation[0] = parseFloat(this._operation[0])
                    }
                    result =  this._operation[0]-por;
                    break;
                case '*':
                    result = por;
                    break;
                case '/':
                    result = (this._operation[0]/ult)*100; //divide o número no indice 0 pelo ultimo valor e multiplca por 100
                    break;
            }
            //result /= 100;
            this._operation = [result];
        }else{
            this._operation = [result]; //faz a conta e calcula o resultado com o próximo valor digitado 
            if (last) this._operation.push(last);
        }
        this.setLastNumberToDisplay();
    }
    getLastItem(isOperator = true){
        let lastItem;
        for(let i = this._operation.length-1; i >= 0; i--){
            if (this.isOperator(this._operation[i])==isOperator){ //verifica se é um operador
                lastItem = this._operation[i];
                break;
            }
        }
        if (!lastItem){
            //se for verdade    ? = então             : = senão
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber; 
        }
        return lastItem;
    }
    setLastNumberToDisplay(){
        let lastNumber = this.getLastItem(false);
    
        if (!lastNumber) lastNumber = 0;
        this.displayCalc = lastNumber;
    }
    addOperation(value){

        if(isNaN(this.getLastOperation())){ //se o valor que vir não for número
            if(this.isOperator(value)){
                return this.setLastoperation(value); //troca o último index (operador) e troca por outro.
            }else if (isNaN(value)){
            }else{
                this.pushOperation(value)
                this.setLastNumberToDisplay();
            }

        }else{ //se for número
            if(this.isOperator(value)){ //precisa dessa função aqui, pois a senão, o operador não será acrescentado no fim do código
                this.pushOperation(value)
            }else{
                let newValue = this.getLastOperation().toString()+value.toString();
                this.setLastoperation(newValue);

                this.setLastNumberToDisplay();
            }

        }
    }
    addDot(){
        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.')> -1) return;
        //se não tiver número antes do ponto
        if (this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.')
        }else{
            //se tiver número depois do ponto
            this.setLastoperation(lastOperation.toString()+'.');
        }
        this.setLastNumberToDisplay();
    }
    setError(){
        this.displayCalc = "Error";
    }
    execBtn(value){
        this.playAudio();
        switch (value){
            case 'ac':
                this.clearAll()
                break;
            case 'ce':
                this.clearEntry()
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot('.');
                break;
            
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
                break;
        }
    }
    initButtonEvents(){
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        buttons.forEach((btn, index)=>{ //colocar parenteses a partir de dois elmentos
            this.addEventListenerAll(btn,'click drag', e=>{
                let textBtn = btn.className.baseVal.replace("btn-","")
                this.execBtn(textBtn);
            });
            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e=>{
                btn.style.cursor = "pointer"
            })
        })
    }



    setdisplayDateTime(){
        /* Para adicionar nome pra data (17 de março de 2018)
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day: "2-digit", //traz o dia em dois digitos
            month: "long", //traz o mês escrito por extenso
            year: "numeric", //4 digitos
        })*/

        this.displayDate = this.currentDate.toLocaleDateString(this._locale)
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale)
    }
    get displayDate(){
        return this._dateEl.innerHTML
    }
    set displayDate(value){
        return this._dateEl.innerHTML = value;
    }
    get displayTime(){
        return this._timeEl.innerHTML
    }
    set displayTime(value){
        return this._timeEl.innerHTML = value;
    }
    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }
    set displayCalc(value){
        if (value.toString().length > 10){
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;
    }
    get currentDate(){
        return new Date();
    }
    set currentDate(date){
        this._currentDate = date;
    }
}