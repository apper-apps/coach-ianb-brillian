import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { questionsService } from "@/services/api/questionsService";
import { answersService } from "@/services/api/answersService";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ConfidenceMeter from "@/components/molecules/ConfidenceMeter";
import CitationCard from "@/components/molecules/CitationCard";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
const ChatInterface = ({ className = "" }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answerFormat, setAnswerFormat] = useState("detailed"); // detailed or summary
  const [showCitations, setShowCitations] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

try {
const question = await questionsService.create({
        text: userMessage.content,
        userId: 1,
        answerFormat: answerFormat
      });

      // Generate answer
      const answer = await answersService.generateAnswer(question.Id, answerFormat);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: answer.content,
        confidence: answer.confidence,
        citations: answer.citations,
        timestamp: new Date(),
        questionId: question.Id,
        answerId: answer.Id
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (answer.confidence < 0.6) {
        toast.warning("This answer has lower confidence. Please review the citations carefully.");
      }
    } catch (error) {
      console.error("Error generating answer:", error);
      toast.error("Failed to generate answer. Please try again.");
      
      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: "I encountered an error while processing your question. Please try rephrasing or contact support if the issue persists.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationOpen = (citation) => {
    toast.info(`Opening: ${citation.source.title}`);
    // In a real implementation, this would open the source document/media at the specific location
  };

const exportAnswer = async (message, format = "pdf") => {
    try {
      const answerText = message.content || message.answer || '';
      const questionText = message.question || 'Question not available';
      const confidence = message.confidence || 0;
      const citations = message.citations || [];
      const timestamp = new Date().toLocaleString();

      // Strip HTML tags for plain text content
      const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };

      const plainTextAnswer = stripHtml(answerText);
      const plainTextQuestion = stripHtml(questionText);

      if (format === "pdf") {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.width;
        const margin = 20;
        let y = 30;

        // Title
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.text('Coach IanB Knowledge Base Response', margin, y);
        y += 20;

        // Timestamp and confidence
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Generated: ${timestamp}`, margin, y);
        y += 10;
        pdf.text(`Confidence: ${Math.round(confidence * 100)}%`, margin, y);
        y += 20;

        // Question
        pdf.setFont(undefined, 'bold');
        pdf.text('Question:', margin, y);
        y += 10;
        pdf.setFont(undefined, 'normal');
        const questionLines = pdf.splitTextToSize(plainTextQuestion, pageWidth - 2 * margin);
        pdf.text(questionLines, margin, y);
        y += questionLines.length * 7 + 15;

        // Answer
        pdf.setFont(undefined, 'bold');
        pdf.text('Answer:', margin, y);
        y += 10;
        pdf.setFont(undefined, 'normal');
        const answerLines = pdf.splitTextToSize(plainTextAnswer, pageWidth - 2 * margin);
        pdf.text(answerLines, margin, y);
        y += answerLines.length * 7 + 15;

        // Citations
        if (citations.length > 0) {
          pdf.setFont(undefined, 'bold');
          pdf.text('Sources:', margin, y);
          y += 10;
          pdf.setFont(undefined, 'normal');
          
          citations.forEach((citation, index) => {
            const citationText = `${index + 1}. ${citation.source_title_c || 'Source'} - ${citation.snippet_c || 'No snippet available'}`;
            const citationLines = pdf.splitTextToSize(citationText, pageWidth - 2 * margin);
            pdf.text(citationLines, margin, y);
            y += citationLines.length * 7 + 5;
          });
        }

        pdf.save(`coach-ianb-response-${Date.now()}.pdf`);
        toast.success('PDF exported successfully');

      } else if (format === "docx") {
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                text: "Coach IanB Knowledge Base Response",
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Generated: ${timestamp}`, break: 1 }),
                  new TextRun({ text: `Confidence: ${Math.round(confidence * 100)}%`, break: 1 }),
                ],
              }),
              new Paragraph({
                text: "Question:",
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                text: plainTextQuestion,
              }),
              new Paragraph({
                text: "Answer:",
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                text: plainTextAnswer,
              }),
              ...(citations.length > 0 ? [
                new Paragraph({
                  text: "Sources:",
                  heading: HeadingLevel.HEADING_2,
                }),
                ...citations.map((citation, index) => 
                  new Paragraph({
                    text: `${index + 1}. ${citation.source_title_c || 'Source'} - ${citation.snippet_c || 'No snippet available'}`,
                  })
                )
              ] : [])
            ],
          }],
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coach-ianb-response-${Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('DOCX exported successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${format.toUpperCase()}: ${error.message}`);
    }
  };

  const copyToClipboard = async (content) => {
    try {
      // Strip HTML tags for clipboard
      const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };

      const plainText = stripHtml(content);
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(plainText);
        toast.success("Answer copied to clipboard");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = plainText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Answer copied to clipboard");
      }
    } catch (error) {
      console.error('Copy error:', error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Format Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Answer Format:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAnswerFormat("summary")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                answerFormat === "summary"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setAnswerFormat("detailed")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                answerFormat === "detailed"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCitations(!showCitations)}
        >
          <ApperIcon name="Quote" size={16} className="mr-2" />
          {showCitations ? "Hide" : "Show"} Citations
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {message.type === "user" && (
                <div className="flex justify-end">
                  <Card className="max-w-3xl bg-primary-600 text-white">
                    <p>{message.content}</p>
                    <div className="text-xs text-primary-200 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </Card>
                </div>
              )}

              {message.type === "assistant" && (
                <div className="flex justify-start">
                  <div className="max-w-4xl w-full">
                    <Card className="bg-surface">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center">
                          <ApperIcon name="Brain" size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Coach IanB AI</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="accent" className="text-xs">
                              {answerFormat}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="prose prose-sm max-w-none mb-4">
                        <div dangerouslySetInnerHTML={{ __html: message.content }} />
                      </div>

                      {message.confidence && (
                        <ConfidenceMeter 
                          confidence={message.confidence}
                          className="mb-4"
                        />
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <ApperIcon name="Copy" size={14} className="mr-1" />
                          Copy
                        </Button>
                        
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportAnswer(message, "pdf")}
                        >
                          <ApperIcon name="Download" size={14} className="mr-1" />
                          PDF
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportAnswer(message, "docx")}
                        >
                          <ApperIcon name="FileText" size={14} className="mr-1" />
                          DOCX
                        </Button>
                      </div>
                    </Card>

                    {/* Citations */}
                    {showCitations && message.citations && message.citations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <ApperIcon name="Quote" size={16} />
                          Sources ({message.citations.length})
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                          {message.citations.map((citation, index) => (
                            <CitationCard
                              key={index}
                              citation={citation}
                              index={index + 1}
                              onOpen={() => handleCitationOpen(citation)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {message.type === "error" && (
                <div className="flex justify-start">
                  <Card className="max-w-3xl bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <ApperIcon name="AlertTriangle" size={16} />
                      <p>{message.content}</p>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <Card className="max-w-md bg-surface">
              <Loading type="stream" />
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Coach IanB anything about leadership, business, or faith..."
              className="pr-12"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ApperIcon name="Send" size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{input.length}/2000 characters</span>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;