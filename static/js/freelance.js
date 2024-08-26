const emailSubject = document.getElementById('email-subject');
const emailSend = document.getElementById('email-send');
const containerBox = document.getElementById('container');
const openingPic = document.getElementById('opening-pic');
const openingBox = document.querySelector("#opening");

emailSubject.addEventListener('input', () => {
    var subjectValue = emailSubject.value;
    if (subjectValue.trim() == ""){
        emailSend.href = "#email-send";
    } else {
        emailSend.href = `mailto:subhamsaha59036@outlook.com?subject=${subjectValue}`;
    }
});

openingPic.addEventListener('click', () => {
    containerBox.style.display = "flex";
    openingPic.style.display = "none";
    openingBox.style.display = "none";
});