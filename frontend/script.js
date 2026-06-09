const input = document.querySelector('#input');
const chatContainer = document.querySelector('#messages');
const ask = document.querySelector('#ask');
const companyIdInput = document.querySelector('#companyId');
const pdfFileInput = document.querySelector('#pdf-file');
const uploadButton = document.querySelector('#upload-btn');
const clearButton = document.querySelector('#clear-chat');

input?.addEventListener('keyup', handleEnter);
ask?.addEventListener('click', handleAsk);
uploadButton?.addEventListener('click', handleUpload);
clearButton?.addEventListener('click', handleClear);

const loading = document.createElement('div');
loading.className = 'my-6 animate-pulse';
loading.textContent = 'Thinking...';

function getCompanyId() {
  const companyId = companyIdInput?.value.trim();
  if (!companyId) {
    alert('Please enter a Company ID before uploading or sending a message.');
    return null;
  }
  return companyId;
}

function uint8ArrayToBase64(u8Arr) {
  let CHUNK_SIZE = 0x8000;
  let index = 0;
  let result = '';
  while (index < u8Arr.length) {
    const slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, u8Arr.length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

async function generate(text) {
  const companyId = getCompanyId();
  if (!companyId) return;

  const userMessage = document.createElement('div');
  userMessage.className = 'my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit';
  userMessage.innerHTML = text;
  chatContainer?.appendChild(userMessage);
  input.value = '';
  chatContainer?.appendChild(loading);

  try {
    const assistantMessage = await callServer(text, companyId);
    const assistantmsgEle = document.createElement('div');
    assistantmsgEle.className = 'max-w-fit';
    assistantmsgEle.textContent = assistantMessage;
    loading.remove();
    chatContainer?.appendChild(assistantmsgEle);
  } catch (error) {
    loading.remove();
    const errorEle = document.createElement('div');
    errorEle.className = 'my-6 rounded-xl bg-red-600/20 p-3 text-red-200';
    errorEle.textContent = `Error: ${error.message}`;
    chatContainer?.appendChild(errorEle);
    console.error(error);
  }
}

async function callServer(inputText, companyId) {
  const response = await fetch('/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ companyId, message: inputText }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error generating the response');
  }

  const result = await response.json();
  return result.message;
}

async function handleUpload() {
  const companyId = getCompanyId();
  if (!companyId) return;

  const file = pdfFileInput?.files?.[0];
  if (!file) {
    alert('Please select a PDF file to upload.');
    return;
  }
  if (file.type !== 'application/pdf') {
    alert('Only PDF files are supported.');
    return;
  }

  uploadButton.disabled = true;
  uploadButton.textContent = 'Uploading...';

  const arrayBuffer = await file.arrayBuffer();
  const fileBase64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));

  const response = await fetch('/upload', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ companyId, fileName: file.name, fileBase64 }),
  });

  uploadButton.disabled = false;
  uploadButton.textContent = 'Upload PDF';

  const result = await response.json();
  if (!response.ok) {
    alert(result.message || 'Upload failed');
    return;
  }

  alert(`Document indexed for company: ${companyId}`);
}

async function handleEnter(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const text = input?.value.trim();
    if (!text) return;
    await generate(text);
  }
}

async function handleAsk() {
  const text = input?.value.trim();
  if (!text) return;
  await generate(text);
}

function handleClear() {
  if (!chatContainer) return;
  chatContainer.innerHTML = '';
  if (input) input.value = '';
}