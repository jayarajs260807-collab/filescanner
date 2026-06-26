const BLACKLIST = [
    // SHA-256 of "password" (Demo)
    "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
];

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const resultDiv = document.getElementById("result");
const scanBtn = document.getElementById("scanBtn");

let selectedFile = null;

// Click Upload
dropZone.addEventListener("click", () => {
    fileInput.click();
});

// File Selected
fileInput.addEventListener("change", () => {
    selectedFile = fileInput.files[0];

    if(selectedFile){
        dropZone.innerHTML = `📄 ${selectedFile.name}`;
    }
});

// Drag Events
dropZone.addEventListener("dragover",(e)=>{
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave",()=>{
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop",(e)=>{
    e.preventDefault();

    dropZone.classList.remove("dragover");

    selectedFile = e.dataTransfer.files[0];

    fileInput.files = e.dataTransfer.files;

    dropZone.innerHTML = `📄 ${selectedFile.name}`;
});

// Scan Button
scanBtn.addEventListener("click", scanFile);

async function scanFile(){

    if(!selectedFile){

        showError("Please upload a file first.");

        return;
    }

    resultDiv.style.display="block";
    resultDiv.className="";

    resultDiv.innerHTML="⏳ Scanning...";

    try{

        const buffer = await selectedFile.arrayBuffer();

        const hashBuffer = await crypto.subtle.digest(
            "SHA-256",
            buffer
        );

        const hashArray = Array.from(new Uint8Array(hashBuffer));

        const hash = hashArray
            .map(b=>b.toString(16).padStart(2,"0"))
            .join("");

        const size=(selectedFile.size/1024).toFixed(2);

        if(BLACKLIST.includes(hash)){

            resultDiv.className="malicious";

            resultDiv.innerHTML=`
                <h3>⚠ Threat Detected</h3>

                <p><strong>File:</strong> ${selectedFile.name}</p>

                <p><strong>Size:</strong> ${size} KB</p>

                <p><strong>SHA-256:</strong><br>${hash}</p>

                <p><strong>Status:</strong> Known signature found.</p>
            `;

        }else{

            resultDiv.className="clean";

            resultDiv.innerHTML=`
                <h3>✅ Scan Completed</h3>

                <p><strong>File:</strong> ${selectedFile.name}</p>

                <p><strong>Size:</strong> ${size} KB</p>

                <p><strong>SHA-256:</strong><br>${hash}</p>

                <p><strong>Status:</strong> No matching signatures found.</p>
            `;
        }

    }catch(err){

        showError(err.message);

    }

}

function showError(message){

    resultDiv.style.display="block";

    resultDiv.className="error";

    resultDiv.innerHTML=`❌ ${message}`;

}
