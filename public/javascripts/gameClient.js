let selectedSingle = false;
let selectedFirst = false;
let selectedSecond = false;
let selectedThird = false;
let selectedSingleCard = "0";
let selectedMultiple = ["0", "0", "0"];

function selectCard(id){
    const div = document.getElementById(id);
    div.style.top = '440px';
}

function resetCard(id){
    const div = document.getElementById(id);
    div.style.top = '480px';
}

function selectSingleCard(id) {
    if (selectedSingle != "0"){
        if (selectedSingleCard == id){
            resetCard(selectedSingleCard);
            selectedSingleCard = "0";
            selectedSingle = false;
        }
        else{
            resetCard(selectedSingleCard);
            selectedSingleCard = id;
            selectCard(id);
        }
    }
    else{
        selectedSingleCard = id;
        selectCard(id);
        selectedSingle = true;
    }

    var btn = document.getElementById("single-button");

    if(selectedSingle){
        btn.disabled = false;
    }
    else{
        btn.disabled = true;
    }
}

function selectMultipleCard(id) {
    if (selectedFirst && selectedMultiple[0] == id) {
        resetCard(id);
        selectedMultiple[0] = "0";
        selectedFirst = false;
    }
    else if (!selectedFirst && id != selectedMultiple[1] && id != selectedMultiple[2]) {
        selectedMultiple[0] = id;
        selectCard(id);
        selectedFirst = true;
    }
    else if (selectedSecond && selectedMultiple[1] == id) {
        resetCard(id);
        selectedMultiple[1] = "0";
        selectedSecond = false;
    }
    else if (!selectedSecond && id !=selectedMultiple[2]) {
        selectedMultiple[1] = id;
        selectCard(id);
        selectedSecond = true;
    }
    else if (selectedThird && selectedMultiple[2] == id) {
        resetCard(id);
        selectedMultiple[2] = "0";
        selectedThird = false;
    }
    else if (!selectedThird) {
        selectedMultiple[2] = id;
        selectCard(id);
        selectedThird = true;
    }

    var btn = document.getElementById("multiple-button");

    if(selectedFirst && selectedSecond && selectedThird){
        btn.disabled = false;
    }
    else{
        btn.disabled = true;
    }
}

//call these functions after updating hmtl via socket.io for animations
function leftPlayCard(){
    const div = document.getElementById("60");
    div.style.top = '265px';
    div.style.left = '200px';
    div.style.transform = "rotate(0deg)";
};