    // Elemen DOM
    const fileInput = document.getElementById('fileInput');
    const uploadSection = document.getElementById('uploadSection');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const fileInfo = document.getElementById('fileInfo');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const compressBtn = document.getElementById('compressBtn');
    const resetBtn = document.getElementById('resetBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const percentageText = document.getElementById('percentageText');
    const results = document.getElementById('results');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const originalDimensions = document.getElementById('originalDimensions');
    const originalFormat = document.getElementById('originalFormat');
    const compressedSize = document.getElementById('compressedSize');
    const compressedDimensions = document.getElementById('compressedDimensions');
    const compressedQuality = document.getElementById('compressedQuality');
    const savingsPercentage = document.getElementById('savingsPercentage');
    const savingsSize = document.getElementById('savingsSize');
    const downloadBtn = document.getElementById('downloadBtn');
    const newImageBtn = document.getElementById('newImageBtn');
    const errorMessage = document.getElementById('errorMessage');
    const compressionOptions = document.getElementById('compressionOptions');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const activityLogBtn = document.getElementById('activityLogBtn');
    const activityLogList = document.getElementById('activityLogList');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const activityLogModal = document.getElementById('activityLogModal');
    const closeActivityLogBtn = document.getElementById('closeActivityLogBtn');
    const activityDetailModal = document.getElementById('activityDetailModal');
    const activityLogDetails = document.getElementById('activityLogDetails');
    const closeActivityDetailBtn = document.getElementById('closeActivityDetailBtn');

    // Variabel state
    let originalFile = null;
    let compressedBlob = null;
    let originalImageData = {
      width: 0,
      height: 0,
      format: '',
      size: 0
    };
    let activityLog = JSON.parse(localStorage.getItem('imageCompressionLog')) || [];
    let activityLogImages = JSON.parse(localStorage.getItem('imageCompressionLogImages')) || {};

    // Event Listeners
    fileInput.addEventListener('change', handleFileSelect);
    qualitySlider.addEventListener('input', updateQualityValue);
    compressBtn.addEventListener('click', compressImage);
    resetBtn.addEventListener('click', resetAll);
    newImageBtn.addEventListener('click', resetAll);
    helpBtn.addEventListener('click', showHelpModal);
    closeHelpBtn.addEventListener('click', hideHelpModal);
    activityLogBtn.addEventListener('click', showActivityLogModal);
    closeActivityLogBtn.addEventListener('click', hideActivityLogModal);
    clearLogBtn.addEventListener('click', clearActivityLog);
    closeActivityDetailBtn.addEventListener('click', hideActivityDetailModal);

    // Initialize
    updateQualityValue();
    compressionOptions.style.display = 'none';

    // Drag and drop functionality
    uploadSection.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadSection.classList.add('drag-over');
    });

    uploadSection.addEventListener('dragleave', () => {
      uploadSection.classList.remove('drag-over');
    });

    uploadSection.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadSection.classList.remove('drag-over');
      
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect({ target: fileInput });
      }
    });

    // Help modal functions
    function showHelpModal() {
      helpModal.classList.add('show');
      helpModal.classList.remove('hidden');
    }

    function hideHelpModal() {
      helpModal.classList.remove('show');
      setTimeout(() => helpModal.classList.add('hidden'), 300);
    }

    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        hideHelpModal();
      }
    });

    // Activity Log functions
    function showActivityLogModal() {
      updateActivityLog();
      activityLogModal.classList.add('show');
      activityLogModal.classList.remove('hidden');
    }

    function hideActivityLogModal() {
      activityLogModal.classList.remove('show');
      setTimeout(() => activityLogModal.classList.add('hidden'), 300);
    }

    function updateActivityLog() {
      if (activityLog.length === 0) {
        activityLogList.innerHTML = '<li class="activity-log-empty">Belum ada aktivitas</li>';
        clearLogBtn.disabled = true;
        return;
      }

      clearLogBtn.disabled = false;
      activityLogList.innerHTML = '';

      // Sort by timestamp (newest first)
      const sortedLog = [...activityLog].sort((a, b) => b.timestamp - a.timestamp);

      sortedLog.forEach((log, index) => {
        const li = document.createElement('li');
        li.className = 'activity-log-item';
        
        const time = new Date(log.timestamp);
        const timeString = time.toLocaleString();
        
        // Get thumbnail URLs
        const originalThumbUrl = activityLogImages[`original_thumb_${log.timestamp}`];
        const compressedThumbUrl = activityLogImages[`compressed_thumb_${log.timestamp}`];
        
        li.innerHTML = `
          <div class="activity-log-info">
            <div class="activity-log-name">${log.fileName}</div>
            <div class="activity-log-details">
              <span>${formatFileSize(log.originalSize)} → ${formatFileSize(log.compressedSize)}</span>
              <span class="activity-log-savings">${log.savingsPercent}% penghematan</span>
            </div>
          </div>
          <div>
            <span class="activity-log-time">${timeString}</span>
            <div class="activity-log-view" data-index="${index}">Lihat detail</div>
          </div>
        `;
        
        activityLogList.appendChild(li);
      });

      // Add event listeners to view buttons
      document.querySelectorAll('.activity-log-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.getAttribute('data-index');
          showActivityDetails(index);
        });
      });
    }

    function showActivityDetails(index) {
      const log = activityLog[index];
      const time = new Date(log.timestamp);
      
      // Get image URLs from storage
      const originalImageUrl = activityLogImages[`original_${log.timestamp}`];
      const compressedImageUrl = activityLogImages[`compressed_${log.timestamp}`];
      
      activityLogDetails.innerHTML = `
        <h3>${log.fileName}</h3>
        <p><strong>Waktu:</strong> ${time.toLocaleString()}</p>
        
        <div style="display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <h4>Gambar Asli</h4>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: center;">
              ${originalImageUrl ? 
                `<div class="log-image-container">
                  <img src="${originalImageUrl}" class="log-image-preview">
                </div>` : 
                '<p style="color: var(--gray);">Gambar tidak tersedia</p>'}
              <p><strong>Ukuran:</strong> ${formatFileSize(log.originalSize)}</p>
              <p><strong>Dimensi:</strong> ${log.originalDimensions}</p>
              <p><strong>Format:</strong> ${log.originalFormat}</p>
            </div>
          </div>
          
          <div style="flex: 1; min-width: 300px;">
            <h4>Hasil Kompresi</h4>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: center;">
              ${compressedImageUrl ? 
                `<div class="log-image-container">
                  <img src="${compressedImageUrl}" class="log-image-preview">
                </div>` : 
                '<p style="color: var(--gray);">Gambar tidak tersedia</p>'}
              <p><strong>Ukuran:</strong> ${formatFileSize(log.compressedSize)}</p>
              <p><strong>Dimensi:</strong> ${log.compressedDimensions}</p>
              <p><strong>Kualitas:</strong> ${log.quality}%</p>
            </div>
          </div>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 8px; text-align: center;">
          <h4>Penghematan</h4>
          <p style="font-size: 1.2rem; font-weight: bold; color: #059669;">
            ${log.savingsPercent}% (${formatFileSize(log.originalSize - log.compressedSize)})
          </p>
        </div>
      `;
      
      hideActivityLogModal();
      activityDetailModal.classList.add('show');
      activityDetailModal.classList.remove('hidden');
    }

    function hideActivityDetailModal() {
      activityDetailModal.classList.remove('show');
      setTimeout(() => activityDetailModal.classList.add('hidden'), 300);
      showActivityLogModal();
    }

    function createImageThumbnail(imageUrl, callback) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set thumbnail dimensions (max 100px)
        const maxSize = 100;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        callback(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = imageUrl;
    }

    function addToActivityLog(logData, originalImageUrl, compressedImageUrl) {
      // Create thumbnails first
      createImageThumbnail(originalImageUrl, (originalThumbUrl) => {
        createImageThumbnail(compressedImageUrl, (compressedThumbUrl) => {
          // Save all image data
          activityLogImages[`original_${logData.timestamp}`] = originalImageUrl;
          activityLogImages[`compressed_${logData.timestamp}`] = compressedImageUrl;
          activityLogImages[`original_thumb_${logData.timestamp}`] = originalThumbUrl;
          activityLogImages[`compressed_thumb_${logData.timestamp}`] = compressedThumbUrl;
          
          activityLog.push(logData);
          
          // Keep only the last 10 items to save space
          if (activityLog.length > 10) {
            const removed = activityLog.shift();
            // Remove associated images
            delete activityLogImages[`original_${removed.timestamp}`];
            delete activityLogImages[`compressed_${removed.timestamp}`];
            delete activityLogImages[`original_thumb_${removed.timestamp}`];
            delete activityLogImages[`compressed_thumb_${removed.timestamp}`];
          }
          
          localStorage.setItem('imageCompressionLog', JSON.stringify(activityLog));
          localStorage.setItem('imageCompressionLogImages', JSON.stringify(activityLogImages));
          updateActivityLog();
        });
      });
    }

    function clearActivityLog() {
      activityLog = [];
      activityLogImages = {};
      localStorage.removeItem('imageCompressionLog');
      localStorage.removeItem('imageCompressionLogImages');
      updateActivityLog();
    }

    activityLogModal.addEventListener('click', (e) => {
      if (e.target === activityLogModal) {
        hideActivityLogModal();
      }
    });

    activityDetailModal.addEventListener('click', (e) => {
      if (e.target === activityDetailModal) {
        hideActivityDetailModal();
      }
    });

    // Fungsi untuk menangani pemilihan file
    function handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;

      // Validasi tipe file
      if (!file.type.match('image.*')) {
        showError('Silakan pilih file gambar (JPEG, PNG, dll)');
        return;
      }

      // Validasi ukuran file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError('Ukuran file terlalu besar. Maksimal 10MB.');
        return;
      }

      clearError();
      originalFile = file;
      
      // Tampilkan preview
      const reader = new FileReader();
      reader.onload = function(event) {
        previewImage.src = event.target.result;
        previewContainer.style.display = 'block';
        uploadSection.classList.add('active');
        compressionOptions.style.display = 'block';
        
        // Tampilkan info file
        fileInfo.innerHTML = `
          <strong>${file.name}</strong><br>
          ${formatFileSize(file.size)}
        `;
        
        // Aktifkan tombol
        compressBtn.disabled = false;
        resetBtn.disabled = false;
        
        // Dapatkan dimensi gambar
        const img = new Image();
        img.onload = function() {
          originalImageData = {
            width: img.width,
            height: img.height,
            format: file.type.split('/')[1].toUpperCase() || 'Unknown',
            size: file.size
          };
        };
        img.onerror = function() {
          showError('Gagal memuat gambar');
          resetBtn.disabled = false;
        };
        img.src = event.target.result;
      };
      reader.onerror = function() {
        showError('Gagal membaca file');
        resetBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    }

    // Fungsi untuk memperbarui nilai kualitas
    function updateQualityValue() {
      const value = Math.round(qualitySlider.value * 100);
      qualityValue.textContent = `${value}%`;
    }

    // Fungsi untuk kompresi gambar
    function compressImage() {
      if (!originalFile) return;
      
      // Sembunyikan hasil sebelumnya
      results.style.display = 'none';
      clearError();
      
      // Tampilkan progress bar
      progressContainer.style.display = 'block';
      progressFill.style.width = '0%';
      percentageText.textContent = '0%';
      progressText.textContent = 'Mengompresi gambar...';
      
      // Nonaktifkan tombol
      compressBtn.disabled = true;
      resetBtn.disabled = true;
      
      // Simulasikan progress untuk UX yang lebih baik
      simulateProgress();
      
      // Proses kompresi dengan timeout untuk animasi
      setTimeout(() => {
        processCompression();
      }, 100);
    }

    // Fungsi untuk simulasi progress (untuk UX)
    function simulateProgress() {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 90) {
          clearInterval(interval);
          return;
        }
        progressFill.style.width = `${progress}%`;
        percentageText.textContent = `${Math.floor(progress)}%`;
      }, 200);
    }

    // Fungsi untuk memproses kompresi
    function processCompression() {
      const img = new Image();
      img.onload = function() {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get quality value
        const quality = parseFloat(qualitySlider.value);
        
        // Convert to JPEG
        try {
          canvas.toBlob((blob) => {
            if (!blob) {
              showError('Gagal mengompresi gambar');
              resetBtn.disabled = false;
              progressContainer.style.display = 'none';
              return;
            }

            compressedBlob = blob;
            
            // Update progress bar
            progressFill.style.width = '100%';
            percentageText.textContent = '100%';
            progressText.textContent = 'Kompresi selesai!';
            
            // Create URL for compressed image
            const compressedUrl = URL.createObjectURL(blob);
            const originalUrl = previewImage.src;
            
            // Update UI dengan hasil
            showResults(compressedUrl, blob, quality);
            
            // Add to activity log
            const fileName = originalFile.name.replace(/\.[^/.]+$/, '');
            const savings = originalFile.size - blob.size;
            const savingsPercent = (savings / originalFile.size * 100).toFixed(1);
            
            addToActivityLog({
              fileName: originalFile.name,
              originalSize: originalFile.size,
              originalDimensions: `${originalImageData.width} × ${originalImageData.height}`,
              originalFormat: originalImageData.format,
              compressedSize: blob.size,
              compressedDimensions: `${canvas.width} × ${canvas.height}`,
              quality: Math.round(quality * 100),
              savingsPercent: savingsPercent,
              timestamp: Date.now()
            }, originalUrl, compressedUrl);
            
            // Sembunyikan progress bar setelah delay kecil
            setTimeout(() => {
              progressContainer.style.display = 'none';
            }, 500);
          }, 'image/jpeg', quality);
        } catch (error) {
          showError('Terjadi kesalahan saat mengompresi gambar');
          console.error(error);
          resetBtn.disabled = false;
          progressContainer.style.display = 'none';
        }
      };
      
      img.onerror = function() {
        showError('Gagal memuat gambar');
        resetBtn.disabled = false;
        progressContainer.style.display = 'none';
      };
      
      img.src = URL.createObjectURL(originalFile);
    }

    // Fungsi untuk menampilkan hasil
    function showResults(compressedUrl, blob, quality) {
      // Set original image and info
      originalImage.src = previewImage.src;
      originalSize.textContent = formatFileSize(originalFile.size);
      originalDimensions.textContent = `${originalImageData.width} × ${originalImageData.height}`;
      originalFormat.textContent = originalImageData.format;
      
      // Set compressed image and info
      compressedImage.src = compressedUrl;
      compressedSize.textContent = formatFileSize(blob.size);
      compressedDimensions.textContent = `${canvas.width} × ${canvas.height}`;
      compressedQuality.textContent = `${Math.round(quality * 100)}%`;
      
      // Hitung penghematan
      const savings = originalFile.size - blob.size;
      const savingsPercent = (savings / originalFile.size * 100).toFixed(1);
      
      savingsPercentage.textContent = savingsPercent;
      savingsSize.textContent = formatFileSize(savings);
      
      // Set download link
      const fileName = originalFile.name.replace(/\.[^/.]+$/, '');
      downloadBtn.href = compressedUrl;
      downloadBtn.download = `compressed_${fileName}.jpg`;
      
      // Tampilkan hasil
      results.style.display = 'block';
      
      // Aktifkan tombol
      resetBtn.disabled = false;
    }

    // Fungsi untuk format ukuran file
    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
      else return (bytes / 1048576).toFixed(2) + ' MB';
    }

    // Fungsi untuk mereset semua
    function resetAll() {
      // Reset file input
      fileInput.value = '';
      originalFile = null;
      compressedBlob = null;
      
      // Reset preview
      previewContainer.style.display = 'none';
      previewImage.src = '';
      fileInfo.textContent = '';
      uploadSection.classList.remove('active');
      compressionOptions.style.display = 'none';
      
      // Reset results
      results.style.display = 'none';
      originalImage.src = '';
      compressedImage.src = '';
      downloadBtn.href = '#';
      downloadBtn.removeAttribute('download');
      
      // Reset progress
      progressContainer.style.display = 'none';
      progressFill.style.width = '0%';
      percentageText.textContent = '0%';
      
      // Reset tombol
      compressBtn.disabled = true;
      resetBtn.disabled = true;
      
      // Reset opsi
      qualitySlider.value = 0.7;
      updateQualityValue();
      
      // Clear error
      clearError();
    }

    // Fungsi untuk menampilkan pesan error
    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    }

    // Fungsi untuk menghapus pesan error
    function clearError() {
      errorMessage.textContent = '';
      errorMessage.style.display = 'none';
    }