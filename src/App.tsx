import React, { useState, useEffect } from 'react';
import { Music, Download, Link2, X, Moon, Sun, Github, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const rapidApiHost = import.meta.env.VITE_RAPIDAPI_HOST;
  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('darkMode');
      if (saved === null) {
        setDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  function extractVideoId(youtubeUrl: string): string {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = youtubeUrl.match(regex);
    return match ? match[1] : youtubeUrl; 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus('loading');
    toast.loading('Processando download...', { id: 'download' });

    try {
      const videoId = extractVideoId(url.trim());
      if (!videoId) {
        throw new Error('ID do vídeo não encontrado.');
      }

      const apiUrl = `https://${rapidApiHost}/dl?id=${videoId}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': rapidApiHost,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na chamada à API (HTTP ${response.status})`);
      }

      const data = await response.json();
      console.log('Resposta JSON da API:', data);

      if (data.status !== 'ok' || !data.link) {
        throw new Error('A API não retornou um link válido.');
      }

      window.open(data.link, '_blank');

      setStatus('success');
      toast.success('Download iniciado!', { id: 'download' });
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast.error('Erro ao baixar música. Verifique o console.', { id: 'download' });
    } finally {
      setUrl('');
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-indigo-50'
      }`}
    >
      <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
        <header className="flex justify-end mb-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${
              darkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </header>

        <main className="flex-grow flex items-center justify-center">
          <div
            className={`max-w-md w-full rounded-2xl shadow-lg p-8 transition-colors duration-200 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-center mb-8">
              <Music
                className={`w-16 h-16 ${darkMode ? 'text-purple-400' : 'text-indigo-600'}`}
              />
            </div>

            <h1
              className={`text-3xl font-bold text-center mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              TuneDrop
            </h1>
            <p
              className={`text-center mb-8 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Baixe suas músicas favoritas do YouTube
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Link2
                    className={`h-5 w-5 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                </div>
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    <X
                      className={`h-5 w-5 ${
                        darkMode
                          ? 'text-gray-500 hover:text-gray-300'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    />
                  </button>
                )}
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Cole o link do YouTube aqui (ou só ID)"
                  className={`w-full pl-10 pr-10 py-3 rounded-lg outline-none transition-colors duration-200
                    ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-indigo-500'
                    } border focus:ring-2 focus:border-transparent`}
                />
              </div>

              <button
                type="submit"
                disabled={!url || status === 'loading'}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg text-white font-medium transition-all duration-200
                  ${
                    !url || status === 'loading'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : darkMode
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                <Download className="h-5 w-5" />
                <span>{status === 'loading' ? 'Baixando...' : 'Baixar Música'}</span>
              </button>
            </form>

            {status === 'success' && (
              <div
                className={`mt-4 p-4 rounded-lg text-center ${
                  darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-50 text-green-700'
                }`}
              >
                Download iniciado com sucesso!
              </div>
            )}

            {status === 'error' && (
              <div
                className={`mt-4 p-4 rounded-lg text-center ${
                  darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-50 text-red-700'
                }`}
              >
                Erro ao fazer o download. Tente novamente.
              </div>
            )}
          </div>
        </main>

        <footer
          className={`mt-8 py-6 text-center ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <div className="flex justify-center space-x-6 mb-4">
            <a
              href="https://github.com/Thxssio"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:scale-110 transition-transform ${
                darkMode ? 'hover:text-white' : 'hover:text-gray-900'
              }`}
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://instagram.com/thxssio"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:scale-110 transition-transform ${
                darkMode ? 'hover:text-white' : 'hover:text-gray-900'
              }`}
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com/in/thxssio"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:scale-110 transition-transform ${
                darkMode ? 'hover:text-white' : 'hover:text-gray-900'
              }`}
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://twitter.com/thxssio"
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:scale-110 transition-transform ${
                darkMode ? 'hover:text-white' : 'hover:text-gray-900'
              }`}
            >
              <Twitter className="w-6 h-6" />
            </a>
          </div>
          <p className="text-sm">
            Desenvolvido por{' '}
            <a
              href="https://github.com/Thxssio"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-medium hover:underline ${
                darkMode ? 'text-purple-400' : 'text-indigo-600'
              }`}
            >
              thxssio
            </a>
          </p>
        </footer>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
