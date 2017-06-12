window.onload = function() {

	var oCalContainer = document.getElementById('cal_container'),
		oTopContainer = document.getElementById('top_container'),
		oTriangle = document.getElementById('triangle'),
		oSaveResult = document.getElementById('save_result'),
		oBtn = document.getElementById('btn');

	var oResult = document.getElementsByClassName('result')[0],
		oExpress = document.getElementsByClassName('expression')[0],
		oSpan = document.getElementById('btn').getElementsByTagName('span');

	//用于保存上一次输入的值
	var preKey = '';
	//用于标记是否对式子进行了计算
	var done = false;
	//用于判断输入的键值是否属于符号
	var symbol = {
		'+': '+',
		'-': '-',
		'×': '*',
		'÷': '/'
	};
	//保存正负号状态
	var minus = '';

	//查看历史记录功能函数
	function showHistory() {
		if (oTriangle.className == 'close') {
			oTopContainer.style.height = '97%';
			oSaveResult.style.height = '97%';
			oBtn.style.display = 'none';
			oTriangle.className = 'open';
			oExpress.style.display = 'none';
			oResult.style.height = '90%';
			oResult.style.overflow = 'auto';
			//将存储在本地的数据显示到页面中
			var keyArray = Mybry.wdb.getKeyArray();
			var html = [];
			for (var i = 0; i < keyArray.length; i++) {
				var val = Mybry.wdb.getItem(keyArray[i]);
				html.push('<li class="history_item">' + val + '</li>');
			}

			if (keyArray.length <= 0) {
				oResult.innerHTML = '<p style="font-size:20px;">尚无历史记录</p>';
			} else {
				oResult.innerHTML = html.join('');
			}
			//添加删除按钮
			oSaveResult.appendChild(delBtn);
		} else {
			var deleteBtn = oSaveResult.removeChild(oSaveResult.lastChild);
			oExpress.style.display = 'block';
			oResult.style.height = '40%';
			oExpress.innerHTML = '';
			oResult.innerHTML = 0;
			oBtn.style.display = 'block';
			oTopContainer.style.height = '27%';
			oSaveResult.style.height = '90%';
			oTriangle.className = 'close';
			oResult.style.overflow = '';
		}
	}

	oTriangle.addEventListener('click', showHistory, false);

	//动态创建删除按钮
	var delBtn = document.createElement('img');
	delBtn.src = 'images/delete.png';
	delBtn.className = 'icon';

	//删除历史记录
	delBtn.onclick = function(e) {
		var e = e || window.event;
		e.stopPropagation();
		if (Mybry.wdb.deleteItem("*")) {
			oResult.innerHTML = '<p style="font-size:20px;">尚无历史记录</p>';
		}
	};

	//点击按钮进行相应的输入和计算
	for (var i = 0; i < oSpan.length; i++) {
		oSpan[i].addEventListener('click', function() {
			var curKey = this.innerHTML;
			calculate(curKey);
			// inputLength(oResult.innerHTML);
			if (oResult.innerHTML.length > 20) {
				oResult.innerHTML = oResult.innerHTML.slice(0, -1);
			}
		}, false);
	}

	// 鼠标点击按钮时改变按钮背景色
	// for (var i = 0; i < oSpan.length; i++) {
	// 	oSpan[i].onmousedown=function(){
	// 		this.style.backgroundColor='#939893';
	// 	}
	// 	oSpan[i].onmouseup=function(){
	// 		this.style.backgroundColor='#fff';
	// 	}
	// }

	//运算符号的逻辑实现
	function cal(symbolType) {

		var result = oResult.innerHTML; //结果的值
		var express = oExpress.innerHTML; //表达式的值
		if (express == '') {
			oExpress.innerHTML += result + symbolType;
			oExpress.innerHTML = oExpress.innerHTML.replace(/×/g, "*").replace(/÷/g, "/");
		} else {
			if (symbol[preKey]) { //如果express==''且上一次输入的也是符号，则点击运算符号可以进行符号的切换
				oExpress.innerHTML = express.replace(/.$/, symbolType);
			} else { //点击符号进行运算
				oExpress.innerHTML += result + symbolType;
				oExpress.innerHTML = oExpress.innerHTML.replace(/×/g, "*").replace(/÷/g, "/");
				oResult.innerHTML = eval(oExpress.innerHTML.slice(0, -1));
			}
		}
		minus = '';
	}

	//判断输入的值是否超过20位数
	function inputLength(inputContent) {
		if (inputContent.length >= 11 && inputContent.length <= 20) {
			oResult.style.paddingTop = 28+'px';
			oResult.style.fontSize = 28+'px';
		} else if (inputContent.length < 11) {
			return false;
		} else {
			alert('输入的数字已经超过最大限度,请重新输入');
			oExpress.innerHTML = '';
			oResult.innerHTML = 0;
			oResult.style.paddingTop = 0;
			oResult.style.fontSize = 50+'px';
		}
	}

	//存储历史记录
	function saveData(val) {
		var key = Mybry.wdb.constant.TABLE_NAME + Mybry.wdb.constant.SEPARATE + Mybry.wdb.getId();
		window.localStorage.setItem(key, val);
	}

	// 实现输入与计算功能的函数
	function calculate(curKey) {

		var result = oResult.innerHTML; //结果的值
		var express = oExpress.innerHTML; //表达式的值

		switch (curKey) {
			case '+/-':
				if (result.indexOf('-') == -1 && result.charAt(0) != 0) {
					oResult.innerHTML = '-' + oResult.innerHTML;
					minus = '-';
				} else {
					oResult.innerHTML = result.replace('-', '');
					minus = '+';
				}
				break;
			case '.':
				if (result.search(/\./) == -1 && preKey != '=') {
					oResult.innerHTML += curKey;
				} else if (preKey == '=') { //如果上一次输入的值是'='，则结果的值变成0.
					oResult.innerHTML = '0.';
					done = false;
				} else {
					return false;
				}
				break;
			case 'C':
				oResult.style.paddingTop = 0;
				oResult.style.fontSize = 50+'px';
				oExpress.innerHTML = '';
				oResult.innerHTML = 0;
				break;
			case '←':
				if (result.length > 1) {
					oResult.innerHTML = result.slice(0, -1);
				} else {
					oResult.innerHTML = 0;
				}
				break;
			// 合并这四种情况	
			case '+':
			case '-':
			case '×':
			case '÷':
				cal(curKey);
				break;
			case '=':
				var oExp = express.replace(/×/g, "*").replace(/÷/g, "/");
				oResult.innerHTML = eval(oExp.concat(result));
				oExpress.innerHTML = '';
				//运算结束后把标记变量设为true
				done = true;
				var saveVal = oExp.concat(result);
				if (saveVal == oResult.innerHTML) {
					return false;
				} else {
					saveData(saveVal.concat('=', oResult.innerHTML));
				}
				inputLength(oResult.innerHTML);
				break;
			default:
				if (result.charAt(0) == 0 && result.search(/\./) == -1) {
					oResult.innerHTML = result.replace(0, curKey);
					done = false;
				} else if (/[\+\-\×\÷]/.test(preKey) && minus == '') { //如果上一次输入的是运算符号，则清空原来的值，重新输入,这边逻辑判断与+/-有冲突，所以又加了一个minus变量用于保存+/-状态
					oResult.innerHTML = '';
					oResult.innerHTML += curKey;
					done = false;
				} else if (done == true) { //判断是否已经对式子进行了计算
					oResult.innerHTML = '';
					oResult.innerHTML += curKey;
					done = false;
				} else {
					oResult.innerHTML += curKey;
					done = false;
				}
				inputLength(oResult.innerHTML);
				break;
		}
		preKey = curKey;
	}
}