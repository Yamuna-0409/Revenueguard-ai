import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  CreditCard,
  ShieldAlert,
  BarChart3,
  FileText,
  Bot,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Activity,
  ArrowUpRight,
  Send,
  Sparkles,
  Search,
  Zap,
  CircleDollarSign,
  Menu,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  // =========================================================
  // STATE
  // =========================================================

  const [activePage, setActivePage] = useState("Dashboard");

  const [dashboard, setDashboard] = useState(null);
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [analyzingId, setAnalyzingId] = useState(null);
  const [recoveringId, setRecoveringId] = useState(null);

  const [error, setError] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);

  // =========================================================
  // CHATBOT STATE
  // =========================================================

  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi! I'm RevenueGuard AI Assistant. I can help you analyze payment risks, failed revenue, root causes and recovery actions.",
    },
  ]);

  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // =========================================================
  // VOICE STATE
  // =========================================================

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Payments",
      icon: CreditCard,
    },
    {
      name: "Recovery",
      icon: ShieldAlert,
    },
    {
      name: "Analytics",
      icon: BarChart3,
    },
    {
      name: "Audit Logs",
      icon: FileText,
    },
    {
      name: "AI Assistant",
      icon: Bot,
    },
  ];

  // =========================================================
  // FETCH DASHBOARD
  // =========================================================

  const fetchDashboard = async () => {
    const response = await fetch(`${API}/dashboard`);

    if (!response.ok) {
      throw new Error("Dashboard API failed");
    }

    const data = await response.json();

    setDashboard(data);
  };

  // =========================================================
  // FETCH PAYMENTS
  // =========================================================

  const fetchPayments = async () => {
    const response = await fetch(`${API}/payments`);

    if (!response.ok) {
      throw new Error("Payments API failed");
    }

    const data = await response.json();

    setPayments(data.payments || []);
  };

  // =========================================================
  // FETCH ANALYTICS
  // =========================================================

  const fetchAnalytics = async () => {
    const response = await fetch(`${API}/analytics`);

    if (!response.ok) {
      throw new Error("Analytics API failed");
    }

    const data = await response.json();

    setAnalytics(data);
  };

  // =========================================================
  // FETCH AUDIT LOGS
  // =========================================================

  const fetchAuditLogs = async () => {
    const response = await fetch(`${API}/audit-logs`);

    if (!response.ok) {
      throw new Error("Audit Logs API failed");
    }

    const data = await response.json();

    setAuditLogs(data.logs || []);
  };

  // =========================================================
  // LOAD ALL DATA
  // =========================================================

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      await Promise.all([
        fetchDashboard(),
        fetchPayments(),
        fetchAnalytics(),
        fetchAuditLogs(),
      ]);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to RevenueGuard AI backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadData();

    // Check browser voice support
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // =========================================================
  // FAILED PAYMENTS
  // =========================================================

  const failedPayments = payments.filter(
    (payment) =>
      payment.payment_status?.toLowerCase() === "failed"
  );

  // =========================================================
  // SUCCESSFUL PAYMENTS
  // =========================================================

  const successfulPayments = payments.filter(
    (payment) =>
      payment.payment_status?.toLowerCase() === "success" ||
      payment.payment_status?.toLowerCase() === "successful"
  );

  // =========================================================
  // GET PAYMENT ANALYSIS
  // =========================================================

  const getPaymentAnalysis = async (paymentId) => {
    const response = await fetch(
      `${API}/analyze/${paymentId}`
    );

    if (!response.ok) {
      throw new Error("Analysis API failed");
    }

    return await response.json();
  };

  // =========================================================
  // ANALYZE PAYMENT
  // =========================================================

  const analyzePayment = async (paymentId) => {
    try {
      setAnalyzingId(paymentId);
      setAnalysis(null);

      const data = await getPaymentAnalysis(paymentId);

      setAnalysis(data);

      setActivePage("Payments");
    } catch (err) {
      console.error(err);

      alert("Unable to analyze this payment.");
    } finally {
      setAnalyzingId(null);
    }
  };

  // =========================================================
  // EXECUTE RECOVERY
  // =========================================================

  const executeRecovery = async (paymentId) => {
    try {
      setRecoveringId(paymentId);

      const response = await fetch(
        `${API}/recover/${paymentId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Recovery API failed");
      }

      const data = await response.json();

      alert(
        `Recovery action executed for ${data.event_id}`
      );

      setAnalysis(null);

      await loadData();
    } catch (err) {
      console.error(err);

      alert("Unable to execute recovery action.");
    } finally {
      setRecoveringId(null);
    }
  };

  // =========================================================
  // SPEAK AI RESPONSE
  // =========================================================

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // =========================================================
  // STOP AI VOICE
  // =========================================================

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  // =========================================================
  // VOICE INPUT
  // =========================================================

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (isListening) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setChatInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission was denied. Please allow microphone access in Chrome."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // =========================================================
  // CHATBOT
  // =========================================================

  const sendMessage = async (customMessage = null) => {
    const message = (
      customMessage || chatInput
    ).trim();

    if (!message || chatLoading) {
      return;
    }

    setChatMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: message,
      },
    ]);

    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat API failed");
      }

      const data = await response.json();

      const reply =
        data.reply ||
        "I could not find an answer.";

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: reply,
        },
      ]);

      // Speak AI response automatically
      speakText(reply);
    } catch (err) {
      console.error(err);

      const errorMessage =
        "I couldn't connect to the RevenueGuard AI service. Please make sure the backend is running.";

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: errorMessage,
        },
      ]);

      speakText(errorMessage);
    } finally {
      setChatLoading(false);
    }
  };

  // =========================================================
  // CHAT ENTER KEY
  // =========================================================

  const handleChatKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      sendMessage();
    }
  };

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  const clearChat = () => {
    stopSpeaking();

    setChatMessages([
      {
        role: "assistant",
        text:
          "Chat cleared. Ask me anything about payment risk, failed revenue or recovery.",
      },
    ]);
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const currency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  // =========================================================
  // RISK CLASS
  // =========================================================

  const getRiskClass = (risk) => {
    if (!risk) {
      return "risk-low";
    }

    return `risk-${risk.toLowerCase()}`;
  };

  // =========================================================
  // GET RISK FROM BACKEND BUSINESS RULES
  // =========================================================

  const getPaymentRisk = (payment) => {
    if (
      payment.payment_status?.toLowerCase() !==
      "failed"
    ) {
      return "LOW";
    }

    let score = 0;

    if (
      payment.payment_status?.toLowerCase() ===
      "failed"
    ) {
      score += 40;
    }

    if (
      payment.failure_reason ===
      "insufficient_funds"
    ) {
      score += 30;
    }

    if (Number(payment.amount) >= 5000) {
      score += 20;
    }

    if (
      payment.payment_method?.toUpperCase() ===
      "UPI"
    ) {
      score += 10;
    }

    if (score >= 70) {
      return "HIGH";
    }

    if (score >= 40) {
      return "MEDIUM";
    }

    return "LOW";
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <ShieldAlert size={32} />
        </div>

        <h2>RevenueGuard AI</h2>

        <p>
          Loading revenue intelligence...
        </p>

        <div className="loading-spinner"></div>
      </div>
    );
  }

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <div className="error-icon">
            <AlertTriangle size={30} />
          </div>

          <h2>Backend Connection Error</h2>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => loadData()}
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  const renderDashboard = () => {
    const risk =
      dashboard?.risk_distribution || {
        high: 0,
        medium: 0,
        low: 0,
      };

    const totalRisk =
      risk.high + risk.medium + risk.low;

    const highPercentage =
      totalRisk > 0
        ? (risk.high / totalRisk) * 100
        : 0;

    const mediumPercentage =
      totalRisk > 0
        ? (risk.medium / totalRisk) * 100
        : 0;

    const lowPercentage =
      totalRisk > 0
        ? (risk.low / totalRisk) * 100
        : 0;

    return (
      <>
        <PageHeader
          title="Revenue Recovery Dashboard"
          description="Monitor failed payments and AI-powered recovery intelligence."
          action={
            <button
              className="secondary-button"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "spin" : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Data"}
            </button>
          }
        />

        <div className="stats-grid">
          <StatCard
            icon={<CreditCard size={20} />}
            title="Total Payments"
            value={
              dashboard?.total_payments || 0
            }
            subtitle="All transactions"
          />

          <StatCard
            icon={
              <AlertTriangle size={20} />
            }
            title="Failed Payments"
            value={
              dashboard?.failed_payments || 0
            }
            subtitle="Needs attention"
            accent="danger"
          />

          <StatCard
            icon={
              <CircleDollarSign size={20} />
            }
            title="Total Revenue"
            value={currency(
              dashboard?.total_revenue
            )}
            subtitle="Successful payments"
          />

          <StatCard
            icon={
              <ShieldAlert size={20} />
            }
            title="At Risk Revenue"
            value={currency(
              dashboard?.failed_revenue
            )}
            subtitle="AI detected risk"
            accent="warning"
          />

          <StatCard
            icon={
              <CheckCircle2 size={20} />
            }
            title="Recovered Revenue"
            value={currency(
              dashboard?.recovered_revenue
            )}
            subtitle="AI recovery actions"
            accent="success"
          />

          <StatCard
            icon={<Activity size={20} />}
            title="Recovery Rate"
            value={`${dashboard?.recovery_rate || 0}%`}
            subtitle="Recovery performance"
            accent="purple"
          />
        </div>

        <div className="dashboard-grid">
          <section className="panel">
            <PanelTitle
              icon={<Activity size={19} />}
              title="Payment Health"
              description="Current transaction performance"
            />

            <div className="health-content">
              <div className="health-main">
                <div className="health-number">
                  {dashboard?.successful_payments ||
                    0}
                </div>

                <div className="health-label">
                  Successful Payments
                </div>
              </div>

              <div className="health-details">
                <div className="health-row">
                  <span>
                    <span className="dot success-dot"></span>
                    Successful
                  </span>

                  <strong>
                    {dashboard?.successful_payments ||
                      0}
                  </strong>
                </div>

                <div className="health-row">
                  <span>
                    <span className="dot danger-dot"></span>
                    Failed
                  </span>

                  <strong>
                    {dashboard?.failed_payments ||
                      0}
                  </strong>
                </div>

                <div className="health-row">
                  <span>
                    <span className="dot warning-dot"></span>
                    At Risk Revenue
                  </span>

                  <strong>
                    {currency(
                      dashboard?.failed_revenue
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <PanelTitle
              icon={
                <ShieldAlert size={19} />
              }
              title="Risk Distribution"
              description="AI-detected payment risk"
            />

            <div className="risk-chart">
              <RiskBar
                label="High Risk"
                value={risk.high}
                percentage={highPercentage}
                className="high"
              />

              <RiskBar
                label="Medium Risk"
                value={risk.medium}
                percentage={mediumPercentage}
                className="medium"
              />

              <RiskBar
                label="Low Risk"
                value={risk.low}
                percentage={lowPercentage}
                className="low"
              />
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel-heading-row">
            <PanelTitle
              icon={
                <AlertTriangle size={19} />
              }
              title="Recent Failed Payments"
              description="Payments requiring AI analysis"
            />

            <button
              className="text-button"
              onClick={() =>
                setActivePage("Payments")
              }
            >
              View all
              <ArrowUpRight size={15} />
            </button>
          </div>

          <PaymentTable
            payments={failedPayments.slice(0, 5)}
            currency={currency}
            getRisk={getPaymentRisk}
            onAnalyze={analyzePayment}
            analyzingId={analyzingId}
          />
        </section>

        <section className="ai-insight">
          <div className="ai-insight-icon">
            <Sparkles size={23} />
          </div>

          <div className="ai-insight-content">
            <h3>
              RevenueGuard AI Insight
            </h3>

            <p>
              {risk.high > 0
                ? `There are ${risk.high} high-risk payment(s) requiring immediate attention. ${currency(
                    dashboard?.failed_revenue
                  )} of failed revenue is currently at risk.`
                : "No high-risk payments currently require immediate attention."}
            </p>
          </div>

          <button
            className="ai-button"
            onClick={() =>
              setActivePage("AI Assistant")
            }
          >
            Ask AI
            <ArrowUpRight size={16} />
          </button>
        </section>
      </>
    );
  };

  // =========================================================
  // PAYMENTS PAGE
  // =========================================================

  const renderPayments = () => {
    return (
      <>
        <PageHeader
          title="Payments"
          description="Monitor payment events and identify revenue at risk."
          action={
            <button
              className="secondary-button"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "spin" : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          }
        />

        <div className="stats-grid compact">
          <StatCard
            icon={<CreditCard size={20} />}
            title="Total"
            value={payments.length}
            subtitle="Transactions"
          />

          <StatCard
            icon={
              <CheckCircle2 size={20} />
            }
            title="Successful"
            value={successfulPayments.length}
            subtitle="Completed"
            accent="success"
          />

          <StatCard
            icon={
              <AlertTriangle size={20} />
            }
            title="Failed"
            value={failedPayments.length}
            subtitle="Requires action"
            accent="danger"
          />

          <StatCard
            icon={
              <IndianRupee size={20} />
            }
            title="At Risk"
            value={currency(
              dashboard?.failed_revenue
            )}
            subtitle="Failed revenue"
            accent="warning"
          />
        </div>

        <section className="panel">
          <PanelTitle
            icon={<CreditCard size={19} />}
            title="Payment Transactions"
            description="All payment events received by RevenueGuard"
          />

          <PaymentTable
            payments={payments}
            currency={currency}
            getRisk={getPaymentRisk}
            onAnalyze={analyzePayment}
            analyzingId={analyzingId}
          />
        </section>

        {analysis && (
          <AnalysisCard
            analysis={analysis}
            currency={currency}
            getRiskClass={getRiskClass}
            onClose={() => setAnalysis(null)}
            onRecovery={() => {
              executeRecovery(
                analysis.payment_id
              );
            }}
            recovering={
              recoveringId ===
              analysis.payment_id
            }
          />
        )}
      </>
    );
  };

  // =========================================================
  // RECOVERY PAGE
  // =========================================================

  const renderRecovery = () => {
    return (
      <>
        <PageHeader
          title="Recovery Center"
          description="AI-generated recovery actions for failed payments."
          action={
            <button
              className="secondary-button"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "spin" : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          }
        />

        <div className="recovery-summary">
          <div className="recovery-summary-item">
            <div className="summary-icon danger">
              <AlertTriangle size={20} />
            </div>

            <div>
              <span>Payments at risk</span>

              <strong>
                {failedPayments.length}
              </strong>
            </div>
          </div>

          <div className="recovery-summary-item">
            <div className="summary-icon warning">
              <IndianRupee size={20} />
            </div>

            <div>
              <span>Revenue at risk</span>

              <strong>
                {currency(
                  dashboard?.failed_revenue
                )}
              </strong>
            </div>
          </div>

          <div className="recovery-summary-item">
            <div className="summary-icon success">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Recovered</span>

              <strong>
                {currency(
                  dashboard?.recovered_revenue
                )}
              </strong>
            </div>
          </div>
        </div>

        {failedPayments.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={30} />}
            title="No failed payments"
            message="There are currently no payments requiring recovery."
          />
        ) : (
          <div className="recovery-grid">
            {failedPayments.map((payment) => {
              const risk =
                getPaymentRisk(payment);

              const isRecovering =
                recoveringId === payment.id;

              let action = "monitor";
              let priority = "low";
              let message =
                "Monitor this payment.";

              if (risk === "HIGH") {
                action = "manual_review";
                priority = "urgent";
                message =
                  "Payment requires immediate manual review.";
              } else if (
                payment.failure_reason ===
                "insufficient_funds"
              ) {
                action = "retry_payment";
                priority = "high";
                message =
                  "Retry payment after customer notification.";
              } else if (
                risk === "MEDIUM"
              ) {
                action =
                  "customer_notification";
                priority = "medium";
                message =
                  "Notify customer about payment failure.";
              }

              return (
                <div
                  className="recovery-card"
                  key={payment.id}
                >
                  <div className="recovery-card-top">
                    <div className="event-icon">
                      <Zap size={20} />
                    </div>

                    <div className="recovery-event">
                      <span>
                        Event ID
                      </span>

                      <strong>
                        {payment.event_id}
                      </strong>
                    </div>

                    <RiskBadge risk={risk} />
                  </div>

                  <div className="recovery-amount">
                    {currency(payment.amount)}
                  </div>

                  <div className="recovery-details">
                    <div>
                      <span>Customer</span>

                      <strong>
                        {payment.customer_id}
                      </strong>
                    </div>

                    <div>
                      <span>Method</span>

                      <strong>
                        {payment.payment_method}
                      </strong>
                    </div>

                    <div>
                      <span>Failure</span>

                      <strong>
                        {payment.failure_reason ||
                          "Unknown"}
                      </strong>
                    </div>
                  </div>

                  <div className="recommendation-box">
                    <div className="recommendation-title">
                      <Sparkles size={16} />
                      AI Recommendation
                    </div>

                    <div className="recommendation-action">
                      <strong>
                        {action}
                      </strong>

                      <span
                        className={`priority ${priority}`}
                      >
                        {priority}
                      </span>
                    </div>

                    <p>
                      {message}
                    </p>
                  </div>

                  <div className="recovery-card-footer">
                    <button
                      className="secondary-button"
                      onClick={() =>
                        analyzePayment(
                          payment.id
                        )
                      }
                      disabled={
                        analyzingId ===
                        payment.id
                      }
                    >
                      <Search size={16} />

                      {analyzingId ===
                      payment.id
                        ? "Analyzing..."
                        : "Analyze"}
                    </button>

                    <button
                      className="primary-button"
                      onClick={() =>
                        executeRecovery(
                          payment.id
                        )
                      }
                      disabled={isRecovering}
                    >
                      <Zap size={16} />

                      {isRecovering
                        ? "Executing..."
                        : "Execute Recovery"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  // =========================================================
  // ANALYTICS PAGE
  // =========================================================

  const renderAnalytics = () => {
    const risk =
      analytics?.risk_distribution || {
        high: 0,
        medium: 0,
        low: 0,
      };

    return (
      <>
        <PageHeader
          title="Analytics"
          description="Understand revenue risk and recovery performance."
          action={
            <button
              className="secondary-button"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "spin" : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          }
        />

        <div className="stats-grid">
          <StatCard
            icon={
              <IndianRupee size={20} />
            }
            title="Failed Revenue"
            value={currency(
              analytics?.failed_revenue
            )}
            subtitle="Revenue at risk"
            accent="danger"
          />

          <StatCard
            icon={
              <CheckCircle2 size={20} />
            }
            title="Recovered Revenue"
            value={currency(
              analytics?.recovered_revenue
            )}
            subtitle="Recovered by actions"
            accent="success"
          />

          <StatCard
            icon={<Activity size={20} />}
            title="Recovery Rate"
            value={`${analytics?.recovery_rate || 0}%`}
            subtitle="Overall recovery"
            accent="purple"
          />

          <StatCard
            icon={<FileText size={20} />}
            title="Audit Events"
            value={
              analytics?.audit_logs_count || 0
            }
            subtitle="Tracked actions"
          />
        </div>

        <div className="dashboard-grid">
          <section className="panel">
            <PanelTitle
              icon={
                <BarChart3 size={19} />
              }
              title="Recovery Performance"
              description="Current revenue recovery metrics"
            />

            <div className="analytics-metrics">
              <AnalyticsMetric
                label="Failed Revenue"
                value={currency(
                  analytics?.failed_revenue
                )}
                className="danger-value"
              />

              <AnalyticsMetric
                label="Recovered Revenue"
                value={currency(
                  analytics?.recovered_revenue
                )}
                className="success-value"
              />

              <AnalyticsMetric
                label="Recovery Rate"
                value={`${analytics?.recovery_rate || 0}%`}
              />
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span>
                  Recovery Progress
                </span>

                <strong>
                  {analytics?.recovery_rate || 0}%
                </strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      analytics?.recovery_rate || 0,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </section>

          <section className="panel">
            <PanelTitle
              icon={
                <ShieldAlert size={19} />
              }
              title="Risk Overview"
              description="Distribution of failed payments"
            />

            <div className="analytics-risk-list">
              <AnalyticsRisk
                label="High Risk"
                value={risk.high}
                className="high"
              />

              <AnalyticsRisk
                label="Medium Risk"
                value={risk.medium}
                className="medium"
              />

              <AnalyticsRisk
                label="Low Risk"
                value={risk.low}
                className="low"
              />
            </div>
          </section>
        </div>

        <section className="panel">
          <PanelTitle
            icon={<Sparkles size={19} />}
            title="AI Revenue Insight"
            description="Automated interpretation of current payment data"
          />

          <div className="insight-list">
            <div className="insight-item">
              <div className="insight-number">
                01
              </div>

              <div>
                <strong>
                  Revenue currently at risk
                </strong>

                <p>
                  {currency(
                    analytics?.failed_revenue
                  )}{" "}
                  is associated with failed
                  payments.
                </p>
              </div>
            </div>

            <div className="insight-item">
              <div className="insight-number">
                02
              </div>

              <div>
                <strong>
                  High-risk payments
                </strong>

                <p>
                  {risk.high} payment(s) are
                  classified as high risk and
                  should receive priority.
                </p>
              </div>
            </div>

            <div className="insight-item">
              <div className="insight-number">
                03
              </div>

              <div>
                <strong>
                  Recovery opportunity
                </strong>

                <p>
                  RevenueGuard can prioritize
                  failed payments based on risk,
                  root cause and recovery policy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  // =========================================================
  // AUDIT LOGS PAGE
  // =========================================================

  const renderAuditLogs = () => {
    return (
      <>
        <PageHeader
          title="Audit Logs"
          description="Track every recovery decision and system action."
          action={
            <button
              className="secondary-button"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "spin" : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          }
        />

        <section className="panel">
          <div className="panel-heading-row">
            <PanelTitle
              icon={
                <FileText size={19} />
              }
              title="Recovery Activity"
              description={`${auditLogs.length} audit event(s) recorded`}
            />

            <div className="audit-live">
              <span></span>
              Live
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <EmptyState
              icon={<FileText size={30} />}
              title="No audit logs"
              message="Recovery actions will appear here."
            />
          ) : (
            <div className="audit-list">
              {auditLogs.map((log) => (
                <div
                  className="audit-item"
                  key={log.id}
                >
                  <div className="audit-icon">
                    <CheckCircle2
                      size={18}
                    />
                  </div>

                  <div className="audit-content">
                    <div className="audit-top">
                      <strong>
                        {log.event_id}
                      </strong>

                      <span>
                        {log.created_at
                          ? new Date(
                              log.created_at
                            ).toLocaleString(
                              "en-IN"
                            )
                          : "Recent"}
                      </span>
                    </div>

                    <p>
                      {log.message}
                    </p>

                    <div className="audit-meta">
                      <span>
                        Action:{" "}
                        <strong>
                          {log.action}
                        </strong>
                      </span>

                      <span>
                        Amount:{" "}
                        <strong>
                          {currency(
                            log.amount
                          )}
                        </strong>
                      </span>

                      <span className="audit-status">
                        {log.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>
    );
  };

  // =========================================================
  // AI ASSISTANT PAGE
  // =========================================================

  const renderAssistant = () => {
    const quickQuestions = [
      "How much revenue is at risk?",
      "Show high risk payments",
      "Why is EV001 high risk?",
      "What should we do for EV002?",
      "What is the recovery strategy?",
      "Explain RevenueGuard AI",
    ];

    return (
      <>
        <PageHeader
          title="AI Revenue Assistant"
          description="Ask RevenueGuard AI about payment risk, root causes and recovery actions."
        />

        <section className="assistant-layout">
          {/* CHAT */}

          <div className="chat-card">
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-avatar">
                  <Bot size={22} />
                </div>

                <div>
                  <strong>
                    RevenueGuard AI
                  </strong>

                  <span>
                    <span className="online-dot"></span>
                    AI Recovery Assistant
                  </span>
                </div>
              </div>

              <div className="chat-header-actions">
                <div className="ai-status">
                  <Sparkles size={15} />
                  Active
                </div>

                <button
                  className="chat-clear"
                  onClick={clearChat}
                  title="Clear chat"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* CHAT BODY */}

            <div className="chat-body">
              {chatMessages.map(
                (message, index) => (
                  <div
                    className={`chat-message ${
                      message.role === "user"
                        ? "user-message"
                        : "assistant-message"
                    }`}
                    key={index}
                  >
                    {message.role ===
                      "assistant" && (
                      <div className="message-avatar">
                        <Bot size={15} />
                      </div>
                    )}

                    <div className="message-content">
                      <div className="message-bubble">
                        {message.text}
                      </div>

                      {message.role ===
                        "assistant" && (
                        <button
                          className="message-speak-button"
                          onClick={() =>
                            isSpeaking
                              ? stopSpeaking()
                              : speakText(
                                  message.text
                                )
                          }
                          title={
                            isSpeaking
                              ? "Stop speaking"
                              : "Read aloud"
                          }
                        >
                          {isSpeaking ? (
                            <VolumeX size={14} />
                          ) : (
                            <Volume2 size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}

              {chatLoading && (
                <div className="chat-message assistant-message">
                  <div className="message-avatar">
                    <Bot size={15} />
                  </div>

                  <div className="message-bubble typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            {/* CHAT INPUT */}

            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                <textarea
                  value={chatInput}
                  onChange={(e) =>
                    setChatInput(
                      e.target.value
                    )
                  }
                  onKeyDown={
                    handleChatKeyDown
                  }
                  placeholder="Ask about payments, risk, recovery..."
                  rows="1"
                />

                {/* VOICE INPUT */}

                <button
                  className={`voice-button ${
                    isListening
                      ? "listening"
                      : ""
                  }`}
                  onClick={startVoiceInput}
                  disabled={
                    chatLoading ||
                    !voiceSupported
                  }
                  title={
                    !voiceSupported
                      ? "Voice input not supported"
                      : isListening
                      ? "Listening..."
                      : "Speak your question"
                  }
                >
                  {isListening ? (
                    <MicOff size={18} />
                  ) : (
                    <Mic size={18} />
                  )}
                </button>

                {/* SEND */}

                <button
                  className="send-button"
                  onClick={() =>
                    sendMessage()
                  }
                  disabled={
                    chatLoading ||
                    !chatInput.trim()
                  }
                >
                  <Send size={17} />
                </button>
              </div>

              {/* VOICE STATUS */}

              <div className="chat-input-footer">
                <small>
                  Press Enter to send · Shift +
                  Enter for a new line
                </small>

                <div className="voice-status">
                  {isListening && (
                    <span className="listening-status">
                      <span></span>
                      Listening...
                    </span>
                  )}

                  {isSpeaking && (
                    <button
                      className="stop-speaking-button"
                      onClick={stopSpeaking}
                    >
                      <VolumeX size={13} />
                      Stop AI Voice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QUICK QUESTIONS */}

          <div className="assistant-side">
            <div className="panel">
              <PanelTitle
                icon={
                  <Sparkles size={18} />
                }
                title="Quick Questions"
                description="Try one of these"
              />

              <div className="quick-question-list">
                {quickQuestions.map(
                  (question) => (
                    <button
                      key={question}
                      onClick={() =>
                        sendMessage(
                          question
                        )
                      }
                    >
                      <span>
                        {question}
                      </span>

                      <ArrowUpRight
                        size={15}
                      />
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="assistant-capabilities">
              <div className="capability-icon">
                <Bot size={19} />
              </div>

              <h3>
                What can AI Assistant do?
              </h3>

              <ul>
                <li>
                  Analyze payment risk
                </li>

                <li>
                  Explain failure reasons
                </li>

                <li>
                  Identify at-risk revenue
                </li>

                <li>
                  Recommend recovery actions
                </li>

                <li>
                  Identify high-risk payments
                </li>

                <li>
                  Answer payment-specific questions
                </li>

                <li>
                  Speak AI responses aloud
                </li>
              </ul>
            </div>
          </div>
        </section>
      </>
    );
  };

  // =========================================================
  // PAGE RENDER
  // =========================================================

  const renderPage = () => {
    if (activePage === "Dashboard") {
      return renderDashboard();
    }

    if (activePage === "Payments") {
      return renderPayments();
    }

    if (activePage === "Recovery") {
      return renderRecovery();
    }

    if (activePage === "Analytics") {
      return renderAnalytics();
    }

    if (activePage === "Audit Logs") {
      return renderAuditLogs();
    }

    if (activePage === "AI Assistant") {
      return renderAssistant();
    }

    return renderDashboard();
  };

  // =========================================================
  // MAIN APP
  // =========================================================

  return (
    <div className="app">
      {/* MOBILE TOPBAR */}

      <div className="mobile-topbar">
        <div className="mobile-brand">
          <ShieldAlert size={22} />

          <span>
            RevenueGuard
          </span>
        </div>

        <button
          onClick={() =>
            setMobileMenu(!mobileMenu)
          }
        >
          {mobileMenu ? (
            <X size={23} />
          ) : (
            <Menu size={23} />
          )}
        </button>
      </div>

      {/* MOBILE OVERLAY */}

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() =>
            setMobileMenu(false)
          }
        ></div>
      )}

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          mobileMenu
            ? "sidebar-open"
            : ""
        }`}
      >
        <div className="brand">
          <div className="brand-icon">
            <ShieldAlert size={23} />
          </div>

          <div>
            <h1>
              RevenueGuard
            </h1>

            <p>
              AI Revenue Recovery
            </p>
          </div>
        </div>

        <div className="sidebar-section-title">
          WORKSPACE
        </div>

        <nav className="navigation">
          {navigation.map(
            (item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  className={`nav-item ${
                    activePage ===
                    item.name
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setActivePage(
                      item.name
                    );

                    setMobileMenu(false);

                    if (
                      item.name !==
                      "Payments"
                    ) {
                      setAnalysis(null);
                    }
                  }}
                >
                  <Icon size={18} />

                  <span>
                    {item.name}
                  </span>

                  {item.name ===
                    "AI Assistant" && (
                    <span className="ai-nav-badge">
                      AI
                    </span>
                  )}
                </button>
              );
            }
          )}
        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">
          <div className="system-online">
            <span className="system-dot"></span>

            <div>
              <strong>
                System Online
              </strong>

              <span>
                Backend connected
              </span>
            </div>
          </div>

          <div className="sidebar-version">
            RevenueGuard AI · v1.0.0
          </div>
        </div>
      </aside>

      {/* CONTENT */}

      <main className="main">
        <div className="main-content">
          {renderPage()}
        </div>
      </main>

      {/* FLOATING AI BUTTON */}

      {activePage !==
        "AI Assistant" && (
        <button
          className="floating-ai"
          onClick={() =>
            setActivePage(
              "AI Assistant"
            )
          }
          title="Open AI Assistant"
        >
          <Bot size={22} />

          <span>
            Ask AI
          </span>
        </button>
      )}
    </div>
  );
}

// =========================================================
// PAGE HEADER COMPONENT
// =========================================================

function PageHeader({
  title,
  description,
  action,
}) {
  return (
    <header className="page-header">
      <div>
        <div className="breadcrumb">
          RevenueGuard AI
          <span>/</span>
          Workspace
        </div>

        <h2>{title}</h2>

        <p>
          {description}
        </p>
      </div>

      {action && (
        <div className="header-action">
          {action}
        </div>
      )}
    </header>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  title,
  value,
  subtitle,
  accent = "",
}) {
  return (
    <div
      className={`stat-card ${accent}`}
    >
      <div className="stat-top">
        <div className="stat-icon">
          {icon}
        </div>
      </div>

      <span className="stat-title">
        {title}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

      <span className="stat-subtitle">
        {subtitle}
      </span>
    </div>
  );
}

// =========================================================
// PANEL TITLE
// =========================================================

function PanelTitle({
  icon,
  title,
  description,
}) {
  return (
    <div className="panel-title">
      <div className="panel-title-icon">
        {icon}
      </div>

      <div>
        <h3>{title}</h3>

        {description && (
          <p>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// =========================================================
// RISK BAR
// =========================================================

function RiskBar({
  label,
  value,
  percentage,
  className,
}) {
  return (
    <div className="risk-bar-item">
      <div className="risk-bar-header">
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

      <div className="risk-track">
        <div
          className={`risk-fill ${className}`}
          style={{
            width:
              value > 0
                ? `${Math.max(
                    percentage,
                    12
                  )}%`
                : "0%",
          }}
        ></div>
      </div>
    </div>
  );
}

// =========================================================
// RISK BADGE
// =========================================================

function RiskBadge({ risk }) {
  return (
    <span
      className={`risk-badge ${
        risk?.toLowerCase() || "low"
      }`}
    >
      <span></span>
      {risk}
    </span>
  );
}

// =========================================================
// PAYMENT TABLE
// =========================================================

function PaymentTable({
  payments,
  currency,
  getRisk,
  onAnalyze,
  analyzingId,
}) {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={
          <CreditCard size={30} />
        }
        title="No payments found"
        message="Payment transactions will appear here."
      />
    );
  }

  return (
    <div className="table-wrapper">
      <table className="payment-table">
        <thead>
          <tr>
            <th>EVENT</th>
            <th>CUSTOMER</th>
            <th>AMOUNT</th>
            <th>METHOD</th>
            <th>STATUS</th>
            <th>RISK</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {payments.map(
            (payment) => {
              const isFailed =
                payment.payment_status?.toLowerCase() ===
                "failed";

              const risk = isFailed
                ? getRisk(payment)
                : "LOW";

              return (
                <tr
                  key={payment.id}
                >
                  <td>
                    <div className="event-cell">
                      <span className="event-dot"></span>

                      <div>
                        <strong>
                          {payment.event_id}
                        </strong>

                        <small>
                          ID #{payment.id}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="customer-id">
                      {payment.customer_id}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {currency(
                        payment.amount
                      )}
                    </strong>
                  </td>

                  <td>
                    <span className="method-badge">
                      {payment.payment_method}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        isFailed
                          ? "failed"
                          : "success"
                      }`}
                    >
                      {payment.payment_status}
                    </span>
                  </td>

                  <td>
                    {isFailed ? (
                      <RiskBadge
                        risk={risk}
                      />
                    ) : (
                      <span className="muted">
                        —
                      </span>
                    )}
                  </td>

                  <td>
                    {isFailed ? (
                      <button
                        className="table-action"
                        onClick={() =>
                          onAnalyze(
                            payment.id
                          )
                        }
                        disabled={
                          analyzingId ===
                          payment.id
                        }
                      >
                        <Search size={15} />

                        {analyzingId ===
                        payment.id
                          ? "Analyzing"
                          : "Analyze"}
                      </button>
                    ) : (
                      <span className="muted">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}

// =========================================================
// ANALYSIS CARD
// =========================================================

function AnalysisCard({
  analysis,
  currency,
  getRiskClass,
  onClose,
  onRecovery,
  recovering,
}) {
  return (
    <section className="panel analysis-card">
      <div className="panel-heading-row">
        <PanelTitle
          icon={<Bot size={19} />}
          title="AI Payment Analysis"
          description={`Detailed analysis for ${analysis.event_id}`}
        />

        <button
          className="icon-button"
          onClick={onClose}
          title="Close analysis"
        >
          <X size={18} />
        </button>
      </div>

      <div className="analysis-grid">
        <div className="analysis-item">
          <span>Payment</span>

          <strong>
            {analysis.event_id}
          </strong>
        </div>

        <div className="analysis-item">
          <span>Amount</span>

          <strong>
            {currency(
              analysis.amount
            )}
          </strong>
        </div>

        <div className="analysis-item">
          <span>Risk Level</span>

          <strong
            className={getRiskClass(
              analysis.risk_level
            )}
          >
            {analysis.risk_level}
          </strong>
        </div>

        <div className="analysis-item">
          <span>Root Cause</span>

          <strong>
            {analysis.root_cause}
          </strong>
        </div>
      </div>

      <div className="analysis-recommendation">
        <div className="recommendation-title">
          <Sparkles size={17} />
          AI Recovery Recommendation
        </div>

        <div className="analysis-action-grid">
          <div>
            <span>
              Recommended Action
            </span>

            <strong>
              {
                analysis
                  .recovery_action
                  ?.action
              }
            </strong>
          </div>

          <div>
            <span>
              Priority
            </span>

            <strong>
              {
                analysis
                  .recovery_action
                  ?.priority
              }
            </strong>
          </div>
        </div>

        <p>
          {
            analysis
              .recovery_action
              ?.message
          }
        </p>
      </div>

      <div className="analysis-footer">
        <button
          className="secondary-button"
          onClick={onClose}
        >
          Close
        </button>

        <button
          className="primary-button"
          onClick={onRecovery}
          disabled={recovering}
        >
          <Zap size={16} />

          {recovering
            ? "Executing..."
            : "Execute Recovery"}
        </button>
      </div>
    </section>
  );
}

// =========================================================
// ANALYTICS METRIC
// =========================================================

function AnalyticsMetric({
  label,
  value,
  className = "",
}) {
  return (
    <div className="analytics-metric">
      <span>
        {label}
      </span>

      <strong className={className}>
        {value}
      </strong>
    </div>
  );
}

// =========================================================
// ANALYTICS RISK
// =========================================================

function AnalyticsRisk({
  label,
  value,
  className,
}) {
  return (
    <div className="analytics-risk">
      <div>
        <span
          className={`risk-mini-dot ${className}`}
        ></span>

        <span>
          {label}
        </span>
      </div>

      <strong>
        {value}
      </strong>
    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  icon,
  title,
  message,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {message}
      </p>
    </div>
  );
}

export default App;