const imageToken = "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";
const audioToken = "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";

const image = document.getElementById("image");
const button = document.getElementById("btn");
const progressContainer = document.getElementById("progress-container");
const progressColor = document.querySelector(".progress .color");
const puzzleButton = document.getElementById("puzzle-button");
const puzzleContainer = document.getElementById("puzzle-container");
const inputTxt = document.getElementById("input");

const rows = 3;
const cols = 3;
const puzzleSize = 300 / rows; // Adjust based on image size

let pieces = [];
let emptyPiece = { row: rows - 1, col: cols - 1 }; // Initialize to the bottom-right corner

async function queryImage(data) {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                headers: {
                    Authorization: `Bearer ${imageToken}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ "inputs": data }),
            }
        );
        if (!response.ok) {
            throw new Error('Failed to generate image.');
        }
        const result = await response.blob();
        return URL.createObjectURL(result);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function queryAudio(text) {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits",
            {
                headers: {
                    Authorization: `Bearer ${audioToken}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ "inputs": text }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Audio generation failed.");
        }

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function playAudio(audioURL) {
    const audio = new Audio(audioURL);
    audio.play();
}


// button.addEventListener("click", async () => {
//     const textPrompt = inputTxt.value;
//     if (!textPrompt) return;

//     try {
//         progressContainer.style.display = 'block';
//         let progress = 0;
//         const interval = setInterval(() => {
//             progress += 10;
//             progressColor.style.width = `${progress}%`;
//             if (progress >= 100) {
//                 clearInterval(interval);
//             }
//         }, 500);

//         const imageURL = await queryImage(textPrompt);
//         image.src = imageURL;
//         image.style.display = 'block';
//         puzzleButton.style.display = 'block';
//         // let name =localStorage.getItem("Name");
//         // Retrieve the username from localStorage
//    // Function to get URL query parameters


// // Retrieve the username from query parameters
//         const queryParams = getQueryParams();
//         const username = queryParams.username;

//         if (username) {
//             console.log('Username:', decodeURIComponent(username));
//     // Use the username in your model logic here
//         } else {
//             console.log('No username found');
//         }

//         console.log(username);
//         let text = "Hi "+username+" Your text is "+textPrompt+" Let's see the generated image: "
//         const audioURL = await queryAudio(text);
//         playAudio(audioURL);
//         localStorage.setItem("url",imageURL);

//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred. Please try again.');
//     } finally {
//         progressContainer.style.display = 'none';
//     }
// });

async function convertBlobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

button.addEventListener("click", async () => {
    const textPrompt = inputTxt.value;
    if (!textPrompt) return;

    try {
        progressContainer.style.display = 'block';
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressColor.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 500);

        const blobURL = await queryImage(textPrompt);
        const response = await fetch(blobURL);
        const blob = await response.blob();
        const dataURL = await convertBlobToDataURL(blob);

        image.src = dataURL;
        image.style.display = 'block';
        puzzleButton.style.display = 'block';

        // Redirect to puzzle page with the dataURL as a query parameter
        puzzleButton.addEventListener("click", () => {
            window.location.href = `./Puzzle game/index.html?imageURL=${encodeURIComponent(dataURL)}`;
        });

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        progressContainer.style.display = 'none';
    }
});



function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        username: params.get('username')
    };
}

// puzzleButton.addEventListener("click", () => {
//     window.location.href = "./Puzzle game/index.html";
// });