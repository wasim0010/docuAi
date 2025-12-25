
import React, { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  Divider, 
  Slider, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Paper, 
  Tooltip,
  CircularProgress,
  Stack,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Fab
} from '@mui/material';
import { 
  FileText, 
  Download, 
  Settings as SettingsIcon, 
  Wand2, 
  Layout, 
  Type, 
  AlignLeft,
  Trash2,
  Copy,
  Info,
  ChevronRight,
  Menu as MenuIcon,
  Sparkles
} from 'lucide-react';
import { PaperSize, Orientation, PDFConfig, AIStatus } from './types';
import { enhanceText } from './services/geminiService';

const DRAWER_WIDTH = 320;

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [config, setConfig] = useState<PDFConfig>({
    fontSize: 12,
    lineHeight: 1.5,
    margin: 20,
    paperSize: PaperSize.A4,
    orientation: Orientation.PORTRAIT,
    fontFamily: 'helvetica'
  });
  const [aiStatus, setAiStatus] = useState<AIStatus>({ loading: false, error: null });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleDownload = useCallback(() => {
    if (!text.trim()) return;

    const doc = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: config.paperSize
    });

    doc.setFont(config.fontFamily);
    doc.setFontSize(config.fontSize);

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = config.margin;
    const maxLineWidth = pageWidth - margin * 2;

    const lines = doc.splitTextToSize(text, maxLineWidth);
    
    let cursorY = margin;
    const pageHeight = doc.internal.pageSize.getHeight();

    lines.forEach((line: string) => {
      if (cursorY + (config.fontSize * 0.35 * config.lineHeight) > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += (config.fontSize * 0.35 * config.lineHeight);
    });

    doc.save('DocuGen-Export.pdf');
  }, [text, config]);

  const handleAIAction = async (action: 'polish' | 'summarize' | 'structure') => {
    if (!text.trim()) return;
    setAiStatus({ loading: true, error: null });
    try {
      const enhanced = await enhanceText(text, action);
      setText(enhanced);
      setAiStatus({ loading: false, error: null });
    } catch (err: any) {
      setAiStatus({ loading: false, error: err.message });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  const clearEditor = () => {
    if (window.confirm('Clear all content from the document?')) {
      setText('');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
        elevation={0}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <MenuIcon size={20} />
            </IconButton>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ bgcolor: 'primary.main', p: 0.8, borderRadius: 1.5, display: 'flex' }}>
                <FileText color="white" size={20} />
              </Box>
              <Typography variant="h6" component="div" sx={{ letterSpacing: -0.5 }}>
                DocuGen <Box component="span" sx={{ color: 'primary.main' }}>AI</Box>
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disableElevation
              startIcon={<Download size={18} />}
              onClick={handleDownload}
              disabled={!text.trim()}
              sx={{ px: 3, borderRadius: 2 }}
            >
              Export PDF
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={isSidebarOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: DRAWER_WIDTH, 
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 3 }}>
          <Stack spacing={4}>
            {/* Typography Group */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, color: 'primary.main' }}>
                <Type size={18} />
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1 }}>Typography</Typography>
              </Stack>
              
              <Stack spacing={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Font Family</InputLabel>
                  <Select
                    value={config.fontFamily}
                    label="Font Family"
                    onChange={(e) => setConfig({...config, fontFamily: e.target.value as any})}
                  >
                    <MenuItem value="helvetica">Helvetica</MenuItem>
                    <MenuItem value="times">Times New Roman</MenuItem>
                    <MenuItem value="courier">Courier</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Font Size: {config.fontSize}px
                  </Typography>
                  <Slider
                    value={config.fontSize}
                    min={8}
                    max={36}
                    onChange={(_, val) => setConfig({...config, fontSize: val as number})}
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Line Height: {config.lineHeight}x
                  </Typography>
                  <Slider
                    value={config.lineHeight}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(_, val) => setConfig({...config, lineHeight: val as number})}
                    size="small"
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Page Setup Group */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, color: 'primary.main' }}>
                <Layout size={18} />
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1 }}>Page Setup</Typography>
              </Stack>

              <Stack spacing={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={config.paperSize}
                    label="Format"
                    onChange={(e) => setConfig({...config, paperSize: e.target.value as PaperSize})}
                  >
                    <MenuItem value={PaperSize.A4}>A4 Standard</MenuItem>
                    <MenuItem value={PaperSize.LETTER}>US Letter</MenuItem>
                    <MenuItem value={PaperSize.LEGAL}>Legal</MenuItem>
                  </Select>
                </FormControl>

                <ToggleButtonGroup
                  value={config.orientation}
                  exclusive
                  onChange={(_, val) => val && setConfig({...config, orientation: val as Orientation})}
                  fullWidth
                  size="small"
                >
                  <ToggleButton value={Orientation.PORTRAIT}>Portrait</ToggleButton>
                  <ToggleButton value={Orientation.LANDSCAPE}>Landscape</ToggleButton>
                </ToggleButtonGroup>

                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Margins: {config.margin}mm
                  </Typography>
                  <Slider
                    value={config.margin}
                    min={5}
                    max={60}
                    step={5}
                    onChange={(_, val) => setConfig({...config, margin: val as number})}
                    size="small"
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* AI Summary Tool */}
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                bgcolor: 'primary.50', 
                borderColor: 'primary.100',
                borderRadius: 3
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Sparkles size={16} className="text-indigo-600" />
                <Typography variant="subtitle2" color="primary.dark">AI Assistant</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Distill your document into a concise executive summary.
              </Typography>
              <Button 
                fullWidth 
                variant="outlined" 
                size="small"
                onClick={() => handleAIAction('summarize')}
                disabled={aiStatus.loading || !text.trim()}
              >
                Generate Summary
              </Button>
            </Paper>
          </Stack>
        </Box>
      </Drawer>

      {/* Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 0, 
          transition: 'margin 0.3s',
          ml: isSidebarOpen ? 0 : `-${DRAWER_WIDTH}px`,
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto'
        }}
      >
        <Box sx={{ maxWidth: '850px', width: '100%', p: 4 }}>
          {/* AI Quick Actions Floating bar or static toolbar */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Stack direction="row" spacing={1}>
              <Button 
                startIcon={<Wand2 size={16} />}
                variant="text" 
                size="small" 
                color="primary"
                onClick={() => handleAIAction('polish')}
                disabled={aiStatus.loading || !text.trim()}
              >
                Polish Writing
              </Button>
              <Button 
                startIcon={<AlignLeft size={16} />}
                variant="text" 
                size="small" 
                color="primary"
                onClick={() => handleAIAction('structure')}
                disabled={aiStatus.loading || !text.trim()}
              >
                Add Structure
              </Button>
            </Stack>
            
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Copy Text">
                <IconButton size="small" onClick={copyToClipboard} color="secondary"><Copy size={16} /></IconButton>
              </Tooltip>
              <Tooltip title="Clear Page">
                <IconButton size="small" onClick={clearEditor} color="error"><Trash2 size={16} /></IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {aiStatus.error && (
            <Alert severity="error" sx={{ mb: 2 }}>{aiStatus.error}</Alert>
          )}

          {/* Document Surface */}
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'relative',
              minHeight: '800px',
              borderRadius: 0, // Traditional paper look
              bgcolor: 'white',
              p: 6,
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
            }}
          >
            {aiStatus.loading && (
              <Box sx={{ 
                position: 'absolute', 
                inset: 0, 
                bgcolor: 'rgba(255,255,255,0.7)', 
                zIndex: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="primary" fontWeight={600}>Refining document...</Typography>
              </Box>
            )}

            <textarea
              placeholder="Begin drafting your professional document..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%',
                height: '1000px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: `${config.fontSize}px`,
                lineHeight: config.lineHeight,
                fontFamily: config.fontFamily === 'helvetica' ? 'sans-serif' : config.fontFamily === 'times' ? 'serif' : 'monospace',
                color: '#1e293b'
              }}
            />
          </Paper>

          {/* Footer Stats */}
          <Box sx={{ mt: 2, px: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              {text.length} Characters • {text.split(/\s+/).filter(Boolean).length} Words
            </Typography>
            <Typography variant="caption" color="text.secondary">
              DocuGen AI Engine v1.1
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Floating Action Button for mobile export */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, position: 'fixed', bottom: 20, right: 20 }}>
        <Fab color="primary" onClick={handleDownload} disabled={!text.trim()}>
          <Download size={24} />
        </Fab>
      </Box>
    </Box>
  );
};

export default App;
