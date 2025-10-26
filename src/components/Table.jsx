"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Euro,
  Search,
  Edit,
  Save,
  X,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  Wallet,
  Copy,
  FileText,
  BarChart3,
  RefreshCw,
  LineChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Calculator,
  Eye,
  EyeOff,
  Star,
  TrendingUp as TrendingUpIcon,
  Settings,
} from "lucide-react";
import "../styles/Table.css";

export default function Table() {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    date: "",
    libelle: "",
    debit: "",
    credit: "",
    note: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editLibelle, setEditLibelle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [editingAmount, setEditingAmount] = useState({
    id: null,
    field: "",
    value: "",
  });
  const [editingDate, setEditingDate] = useState({ id: null, value: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [analyticsPeriod, setAnalyticsPeriod] = useState("3months");
  const [budgetTargets, setBudgetTargets] = useState({
    monthlySpending: 2000,
    savingsRate: 20,
    alertThreshold: 80,
  });
  const [favoriteTransactions, setFavoriteTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [initialBalance, setInitialBalance] = useState(0);
  const [showInitialBalanceModal, setShowInitialBalanceModal] = useState(false);
  const [tempInitialBalance, setTempInitialBalance] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Formater la date en JJ/MM/AAAA
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Obtenir le mois et l'année d'une transaction pour le style alterné
  const getTransactionMonthYear = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
  };

  // Afficher un message de confirmation temporaire
  const showConfirmation = (message, isError = false) => {
    setConfirmationMessage({ text: message, isError });
    setTimeout(() => setConfirmationMessage(""), 3000);
  };

  // Recalculer les soldes en partant du solde initial
  const recalculateAllBalances = React.useCallback(
    (txs, initialBal = initialBalance) => {
      const sorted = [...txs].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      let runningBalance = initialBal;
      return sorted.map((tx) => {
        runningBalance = runningBalance + (tx.credit || 0) - (tx.debit || 0);
        return { ...tx, solde: runningBalance };
      });
    },
    [initialBalance]
  );

  // Calcul du solde en temps réel pour le formulaire
  const calculateCurrentBalance = () => {
    const debit = parseFloat(newTransaction.debit) || 0;
    const credit = parseFloat(newTransaction.credit) || 0;
    return credit - debit;
  };

  const currentBalance = calculateCurrentBalance();

  // Fonction pour déterminer la classe CSS en fonction du solde
  const getBalanceColorClass = (balance) => {
    if (balance >= 3000) return "balance-high";
    if (balance >= 1000) return "balance-medium";
    return "balance-low";
  };

  // Charger les données au montage
  useEffect(() => {
    if (isInitialized) return;

    const savedInitialBalance = localStorage.getItem(
      "comptabilite-initial-balance"
    );
    if (savedInitialBalance !== null) {
      setInitialBalance(parseFloat(savedInitialBalance));
    } else {
      // Si pas de solde initial sauvegardé, montrer la modale
      setShowInitialBalanceModal(true);
    }

    const saved = localStorage.getItem("comptabilite-transactions");
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        const withBalances = recalculateAllBalances(parsedData);
        setTransactions(withBalances);
      } catch (e) {
        console.error("Erreur lors du chargement des données", e);
      }
    }

    const savedBudgetTargets = localStorage.getItem(
      "comptabilite-budget-targets"
    );
    if (savedBudgetTargets) {
      setBudgetTargets(JSON.parse(savedBudgetTargets));
    }

    const savedFavorites = localStorage.getItem("comptabilite-favorites");
    if (savedFavorites) {
      setFavoriteTransactions(JSON.parse(savedFavorites));
    }

    const savedShowBalance = localStorage.getItem("comptabilite-show-balance");
    if (savedShowBalance !== null) {
      setShowBalance(JSON.parse(savedShowBalance));
    }

    setNewTransaction((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
    }));

    const currentDate = new Date();
    setSelectedMonth(
      `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`
    );

    setIsInitialized(true);
  }, [isInitialized, recalculateAllBalances]);

  // Sauvegarder quand les transactions changent
  useEffect(() => {
    if (!isInitialized) return;

    if (transactions.length > 0) {
      localStorage.setItem(
        "comptabilite-transactions",
        JSON.stringify(transactions)
      );
    } else {
      localStorage.removeItem("comptabilite-transactions");
    }
  }, [transactions, isInitialized]);

  // Sauvegarder le solde initial
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(
      "comptabilite-initial-balance",
      initialBalance.toString()
    );
  }, [initialBalance, isInitialized]);

  // Sauvegarder les préférences
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem(
      "comptabilite-budget-targets",
      JSON.stringify(budgetTargets)
    );
    localStorage.setItem(
      "comptabilite-favorites",
      JSON.stringify(favoriteTransactions)
    );
    localStorage.setItem(
      "comptabilite-show-balance",
      JSON.stringify(showBalance)
    );
  }, [budgetTargets, favoriteTransactions, showBalance, isInitialized]);

  // Filtrer les transactions
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions.filter((tx) => {
      const matchesSearch = tx.libelle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      let matchesFilter = true;

      if (filterType === "debit" && tx.debit === 0) matchesFilter = false;
      if (filterType === "credit" && tx.credit === 0) matchesFilter = false;
      if (filterType === "favorites" && !favoriteTransactions.includes(tx.id))
        matchesFilter = false;

      if (dateRange.start && new Date(tx.date) < new Date(dateRange.start))
        matchesFilter = false;
      if (dateRange.end && new Date(tx.date) > new Date(dateRange.end))
        matchesFilter = false;

      return matchesSearch && matchesFilter;
    });

    return filtered;
  }, [transactions, searchTerm, filterType, dateRange, favoriteTransactions]);

  // Calculer les totaux
  const totals = React.useMemo(() => {
    const totalDebit = filteredTransactions.reduce(
      (sum, tx) => sum + (tx.debit || 0),
      0
    );
    const totalCredit = filteredTransactions.reduce(
      (sum, tx) => sum + (tx.credit || 0),
      0
    );
    const finalBalance = initialBalance + totalCredit - totalDebit;

    return {
      debit: totalDebit,
      credit: totalCredit,
      finalBalance,
    };
  }, [filteredTransactions, initialBalance]);

  // Statistiques avancées
  const stats = React.useMemo(() => {
    const totalDebit = filteredTransactions.reduce(
      (sum, tx) => sum + (tx.debit || 0),
      0
    );
    const totalCredit = filteredTransactions.reduce(
      (sum, tx) => sum + (tx.credit || 0),
      0
    );
    const net = totalCredit - totalDebit;

    return {
      totalTransactions: filteredTransactions.length,
      totalDebit,
      totalCredit,
      net,
    };
  }, [filteredTransactions]);

  // Statistiques mensuelles
  const monthlyStats = React.useMemo(() => {
    const months = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (!months[monthKey]) {
        months[monthKey] = {
          debit: 0,
          credit: 0,
          count: 0,
          transactions: [],
          startBalance: 0,
          endBalance: 0,
        };
      }

      months[monthKey].debit += tx.debit || 0;
      months[monthKey].credit += tx.credit || 0;
      months[monthKey].count++;
      months[monthKey].transactions.push(tx);
    });

    // Calculer les soldes de début et fin pour chaque mois
    Object.keys(months).forEach((monthKey) => {
      const monthTransactions = months[monthKey].transactions.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      if (monthTransactions.length > 0) {
        const firstDate = new Date(monthTransactions[0].date);
        const previousTransactions = transactions.filter(
          (tx) =>
            new Date(tx.date) <
            new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
        );

        let balanceBeforeMonth = initialBalance;
        previousTransactions.forEach((tx) => {
          balanceBeforeMonth =
            balanceBeforeMonth + (tx.credit || 0) - (tx.debit || 0);
        });

        months[monthKey].startBalance = balanceBeforeMonth;
        months[monthKey].endBalance =
          balanceBeforeMonth + months[monthKey].credit - months[monthKey].debit;
      }
    });

    return months;
  }, [transactions, initialBalance]);

  // Données pour le graphique
  const chartData = React.useMemo(() => {
    const months = Object.keys(monthlyStats).sort().slice(-6);
    return months.map((month) => {
      const stats = monthlyStats[month];
      const date = new Date(month + "-01");
      const monthName = date.toLocaleDateString("fr-FR", {
        month: "short",
        year: "2-digit",
      });

      return {
        month: monthName,
        debit: stats.debit,
        credit: stats.credit,
        net: stats.credit - stats.debit,
        startBalance: stats.startBalance,
        endBalance: stats.endBalance,
      };
    });
  }, [monthlyStats]);

  // Statistiques détaillées
  const detailedStats = React.useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (analyticsPeriod) {
      case "1month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 3);
    }

    const periodTransactions = filteredTransactions.filter(
      (tx) => new Date(tx.date) >= startDate
    );

    const totalDebit = periodTransactions.reduce(
      (sum, tx) => sum + (tx.debit || 0),
      0
    );
    const totalCredit = periodTransactions.reduce(
      (sum, tx) => sum + (tx.credit || 0),
      0
    );
    const debitCount = periodTransactions.filter((tx) => tx.debit > 0).length;
    const creditCount = periodTransactions.filter((tx) => tx.credit > 0).length;
    const avgDebit = debitCount > 0 ? totalDebit / debitCount : 0;
    const avgCredit = creditCount > 0 ? totalCredit / creditCount : 0;

    const largestDebit = Math.max(
      ...periodTransactions.map((tx) => tx.debit || 0)
    );
    const largestCredit = Math.max(
      ...periodTransactions.map((tx) => tx.credit || 0)
    );

    // Tendance
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(
      previousPeriodStart.getMonth() -
        (analyticsPeriod === "1month"
          ? 1
          : analyticsPeriod === "3months"
          ? 3
          : analyticsPeriod === "6months"
          ? 6
          : 12)
    );

    const previousPeriodTransactions = filteredTransactions.filter(
      (tx) =>
        new Date(tx.date) >= previousPeriodStart &&
        new Date(tx.date) < startDate
    );

    const previousTotalDebit = previousPeriodTransactions.reduce(
      (sum, tx) => sum + (tx.debit || 0),
      0
    );
    const previousTotalCredit = previousPeriodTransactions.reduce(
      (sum, tx) => sum + (tx.credit || 0),
      0
    );

    const debitTrend =
      previousTotalDebit > 0
        ? ((totalDebit - previousTotalDebit) / previousTotalDebit) * 100
        : 0;
    const creditTrend =
      previousTotalCredit > 0
        ? ((totalCredit - previousTotalCredit) / previousTotalCredit) * 100
        : 0;

    return {
      totalDebit,
      totalCredit,
      net: totalCredit - totalDebit,
      transactionCount: periodTransactions.length,
      debitCount,
      creditCount,
      avgDebit,
      avgCredit,
      largestDebit,
      largestCredit,
      debitTrend,
      creditTrend,
      period: analyticsPeriod,
    };
  }, [filteredTransactions, analyticsPeriod]);

  // ANALYSE DE BUDGET
  const budgetAnalysis = React.useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthStats = monthlyStats[currentMonth] || {
      debit: 0,
      credit: 0,
      count: 0,
    };

    const monthlyDebit = currentMonthStats.debit;
    const monthlyCredit = currentMonthStats.credit;
    const monthlyNet = monthlyCredit - monthlyDebit;

    const savingsRate =
      monthlyCredit > 0 ? (monthlyNet / monthlyCredit) * 100 : 0;

    // Alertes de budget
    const alerts = [];

    if (monthlyDebit > budgetTargets.monthlySpending) {
      alerts.push({
        type: "error",
        title: "Dépassement de budget",
        message: `Dépassement de ${(
          monthlyDebit - budgetTargets.monthlySpending
        ).toFixed(2)}€`,
        icon: <Zap size={16} />,
      });
    } else if (
      monthlyDebit >
      budgetTargets.monthlySpending * (budgetTargets.alertThreshold / 100)
    ) {
      alerts.push({
        type: "warning",
        title: "Budget proche de la limite",
        message: `${(
          (monthlyDebit / budgetTargets.monthlySpending) *
          100
        ).toFixed(1)}% utilisé`,
        icon: <AlertTriangle size={16} />,
      });
    }

    if (savingsRate < budgetTargets.savingsRate) {
      alerts.push({
        type: "warning",
        title: "Taux d'épargne faible",
        message: `${savingsRate.toFixed(1)}% (objectif: ${
          budgetTargets.savingsRate
        }%)`,
        icon: <TrendingDown size={16} />,
      });
    } else if (savingsRate > 0) {
      alerts.push({
        type: "success",
        title: "Objectif d'épargne atteint",
        message: `${savingsRate.toFixed(1)}% d'épargne`,
        icon: <TrendingUpIcon size={16} />,
      });
    }

    // Projections
    const averageMonthlyNet =
      Object.values(monthlyStats).reduce(
        (sum, month) => sum + (month.credit - month.debit),
        0
      ) / Math.max(Object.keys(monthlyStats).length, 1);

    const projections = [
      { period: "1 mois", amount: totals.finalBalance + averageMonthlyNet },
      { period: "3 mois", amount: totals.finalBalance + averageMonthlyNet * 3 },
      { period: "6 mois", amount: totals.finalBalance + averageMonthlyNet * 6 },
    ];

    return {
      monthlyDebit,
      monthlyCredit,
      monthlyNet,
      savingsRate,
      alerts,
      projections,
      budgetProgress: (monthlyDebit / budgetTargets.monthlySpending) * 100,
    };
  }, [monthlyStats, totals.finalBalance, budgetTargets]);

  // Gestion des favoris
  const toggleFavorite = (transactionId) => {
    setFavoriteTransactions((prev) => {
      const newFavorites = prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId];
      return newFavorites;
    });
  };

  // Duplication rapide depuis les favoris
  const duplicateFromFavorite = (transaction) => {
    const duplicated = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      libelle: `${transaction.libelle} (copie)`,
    };

    const updatedTransactions = [...transactions, duplicated];
    const withBalances = recalculateAllBalances(updatedTransactions);
    setTransactions(withBalances);
    showConfirmation("Transaction dupliquée depuis les favoris !");
  };

  // Calculatrice intégrée
  const calculateExpression = (expression) => {
    try {
      // Remplace les virgules par des points pour l'évaluation
      const sanitized = expression.replace(/,/g, ".");
      const result = eval(sanitized);
      return isNaN(result) ? null : result;
    } catch {
      return null;
    }
  };

  // Définir le solde initial
  const handleSetInitialBalance = () => {
    const balance = parseFloat(tempInitialBalance) || 0;
    setInitialBalance(balance);
    setShowInitialBalanceModal(false);

    // Recalculer tous les soldes avec le nouveau solde initial
    const withBalances = recalculateAllBalances(transactions, balance);
    setTransactions(withBalances);

    showConfirmation(`Solde initial défini à ${balance.toFixed(2)} €`);
  };

  // Modifier le solde initial
  const handleEditInitialBalance = () => {
    setTempInitialBalance(initialBalance.toString());
    setShowInitialBalanceModal(true);
  };

  // Ajouter une transaction
  const handleAddTransaction = (e) => {
    e.preventDefault();

    if (!newTransaction.libelle.trim()) {
      showConfirmation("Veuillez saisir un libellé", true);
      return;
    }

    if (!newTransaction.debit && !newTransaction.credit) {
      showConfirmation("Veuillez saisir un montant (débit ou crédit)", true);
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      date: newTransaction.date,
      libelle: newTransaction.libelle.trim(),
      debit: parseFloat(newTransaction.debit) || 0,
      credit: parseFloat(newTransaction.credit) || 0,
      note: newTransaction.note,
    };

    const updatedTransactions = [...transactions, transaction];
    const withBalances = recalculateAllBalances(updatedTransactions);
    setTransactions(withBalances);

    setNewTransaction({
      date: new Date().toISOString().split("T")[0],
      libelle: "",
      debit: "",
      credit: "",
      note: "",
    });

    showConfirmation("Transaction ajoutée avec succès !");
  };

  // Mettre la date d'aujourd'hui
  const setToday = () => {
    setNewTransaction((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
    }));
  };

  // Dupliquer une transaction
  const duplicateTransaction = (transaction) => {
    const duplicated = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      libelle: `${transaction.libelle} (copie)`,
    };

    const updatedTransactions = [...transactions, duplicated];
    const withBalances = recalculateAllBalances(updatedTransactions);
    setTransactions(withBalances);
    showConfirmation("Transaction dupliquée avec succès !");
  };

  // Supprimer une transaction
  const handleDeleteTransaction = (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")
    ) {
      const updatedTransactions = transactions.filter((tx) => tx.id !== id);
      const withBalances = recalculateAllBalances(updatedTransactions);
      setTransactions(withBalances);
      showConfirmation("Transaction supprimée avec succès !");
    }
  };

  // Édition des libellés
  const startEdit = (id, currentLibelle) => {
    setEditingId(id);
    setEditLibelle(currentLibelle);
  };

  const saveEdit = (id) => {
    if (!editLibelle.trim()) {
      showConfirmation("Le libellé ne peut pas être vide", true);
      return;
    }

    const updatedTransactions = transactions.map((tx) =>
      tx.id === id ? { ...tx, libelle: editLibelle.trim() } : tx
    );
    const withBalances = recalculateAllBalances(updatedTransactions);
    setTransactions(withBalances);
    setEditingId(null);
    setEditLibelle("");
    showConfirmation("Libellé modifié avec succès !");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLibelle("");
  };

  // Édition des montants
  const startAmountEdit = (id, field, currentValue) => {
    setEditingAmount({ id, field, value: currentValue || "" });
  };

  const saveAmountEdit = (id, field) => {
    const value = parseFloat(editingAmount.value) || 0;

    const updatedTransactions = transactions.map((tx) =>
      tx.id === id
        ? {
            ...tx,
            [field]: value,
            ...(field === "debit" && value > 0 ? { credit: 0 } : {}),
            ...(field === "credit" && value > 0 ? { debit: 0 } : {}),
          }
        : tx
    );

    const withBalances = recalculateAllBalances(updatedTransactions);
    setTransactions(withBalances);
    setEditingAmount({ id: null, field: "", value: "" });
    showConfirmation("Montant modifié avec succès !");
  };

  const cancelAmountEdit = () => {
    setEditingAmount({ id: null, field: "", value: "" });
  };

  // Édition des dates
  const startDateEdit = (id, currentDate) => {
    setEditingDate({ id, value: currentDate });
  };

  const saveDateEdit = (id) => {
    if (!editingDate.value) {
      showConfirmation("La date ne peut pas être vide", true);
      return;
    }

    const updatedTransactions = transactions.map((tx) =>
      tx.id === id ? { ...tx, date: editingDate.value } : tx
    );

    // Recalculer les soldes après modification de la date
    const withBalances = recalculateAllBalances(updatedTransactions);
    setTransactions(withBalances);
    setEditingDate({ id: null, value: "" });
    showConfirmation("Date modifiée avec succès !");
  };

  const cancelDateEdit = () => {
    setEditingDate({ id: null, value: "" });
  };

  // Exporter les données
  const exportData = () => {
    const data = {
      initialBalance,
      transactions,
      exportDate: new Date().toISOString(),
      totalTransactions: transactions.length,
      totals: totals,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comptabilite-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showConfirmation("Données exportées avec succès !");
  };

  // Importer les données
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.transactions && Array.isArray(data.transactions)) {
          // Si le fichier importé a un solde initial, l'utiliser
          if (data.initialBalance !== undefined) {
            setInitialBalance(data.initialBalance);
          }
          const withBalances = recalculateAllBalances(data.transactions);
          setTransactions(withBalances);
          showConfirmation("Données importées avec succès !");
        } else {
          showConfirmation("Format de fichier invalide", true);
        }
      } catch (error) {
        showConfirmation("Erreur lors de l'importation", true);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setDateRange({ start: "", end: "" });
  };

  // Obtenir les mois disponibles
  const availableMonths = Object.keys(monthlyStats).sort().reverse();

  // Statistiques du mois sélectionné
  const selectedMonthStats = monthlyStats[selectedMonth] || {
    debit: 0,
    credit: 0,
    count: 0,
    startBalance: initialBalance,
    endBalance: initialBalance,
  };

  // Calculer la hauteur des barres pour le graphique
  const maxValue =
    Math.max(...chartData.map((d) => Math.max(d.debit, d.credit))) || 1;

  // Transactions favorites
  const favoriteTransactionsList = transactions.filter((tx) =>
    favoriteTransactions.includes(tx.id)
  );

  // Déterminer la classe de ligne pour l'alternance des mois
  const getRowClass = (transaction, index) => {
    const monthYear = getTransactionMonthYear(transaction.date);
    const monthIndex = [
      ...new Set(transactions.map((tx) => getTransactionMonthYear(tx.date))),
    ].indexOf(monthYear);
    return `month-${(monthIndex % 6) + 1}`;
  };

  return (
    <div className="accounting">
      {/* Message de confirmation */}
      {confirmationMessage && (
        <div
          className={`confirmation-message ${
            confirmationMessage.isError ? "error" : ""
          }`}
        >
          {confirmationMessage.isError ? "❌" : "✅"}
          {confirmationMessage.text}
        </div>
      )}

      {/* MODALE SOLDE INITIAL */}
      {showInitialBalanceModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowInitialBalanceModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Wallet size={20} />
                Définir le solde initial
              </h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Solde initial du compte (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tempInitialBalance}
                  onChange={(e) => setTempInitialBalance(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div
                className="form-actions"
                style={{ marginTop: "1rem", justifyContent: "flex-end" }}
              >
                <button
                  className="btn btn-primary"
                  onClick={handleSetInitialBalance}
                >
                  <Save size={16} />
                  Définir le solde
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER AVEC STATS RAPIDES */}
      <div className="dashboard-header">
        <div className="header-stats">
          <div className="stat-item main-stat">
            <div className="stat-icon">
              <Wallet size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {showBalance ? `${totals.finalBalance.toFixed(2)} €` : "••••••"}
              </div>
              <div className="stat-label">Solde actuel</div>
            </div>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button
                className="btn-icon visibility-toggle"
                onClick={handleEditInitialBalance}
                title="Modifier le solde initial"
              >
                <Edit size={14} />
              </button>
              <button
                className="btn-icon visibility-toggle"
                onClick={() => setShowBalance(!showBalance)}
                title={showBalance ? "Masquer le solde" : "Afficher le solde"}
              >
                {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon income">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value positive">
                +{stats.totalCredit.toFixed(2)} €
              </div>
              <div className="stat-label">Revenus</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon expense">
              <TrendingDown size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value negative">
                -{stats.totalDebit.toFixed(2)} €
              </div>
              <div className="stat-label">Dépenses</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon transaction">
              <FileText size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalTransactions}</div>
              <div className="stat-label">Opérations</div>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowAnalyticsModal(true)}
          >
            <LineChart size={16} />
            Analytics
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowMonthlyModal(true)}
          >
            <BarChart3 size={16} />
            Mensuel
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowBudgetModal(true)}
          >
            <Target size={16} />
            Budget
          </button>
          <button className="btn btn-secondary" onClick={exportData}>
            <Upload size={16} />
            Exporter
          </button>
          <label className="btn btn-secondary import-btn">
            <Download size={16} />
            Importer
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* DISPOSITION PRINCIPALE OPTIMISÉE */}
      <div className="main-layout">
        {/* COLONNE GAUCHE - FORMULAIRE */}
        <div className="left-column">
          {/* FORMULAIRE SIMPLIFIÉ */}
          <div className="card form-card">
            <div className="card-header">
              <h2>
                <Plus size={18} />
                Nouvelle Opération
              </h2>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => {
                    const expression = prompt(
                      "Entrez un calcul (ex: 50+25-10):"
                    );
                    if (expression) {
                      const result = calculateExpression(expression);
                      if (result !== null) {
                        showConfirmation(`Résultat: ${result}`);
                      } else {
                        showConfirmation("Calcul invalide", true);
                      }
                    }
                  }}
                  title="Calculatrice"
                >
                  <Calculator size={16} />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddTransaction}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date</label>
                  <div className="date-input-wrapper">
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="today-btn"
                      onClick={setToday}
                    >
                      Auj.
                    </button>
                  </div>
                </div>

                <div className="form-group wide">
                  <label>Libellé</label>
                  <input
                    type="text"
                    placeholder="Description de l'opération..."
                    value={newTransaction.libelle}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        libelle: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group wide">
                  <label>Note (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ajouter une note..."
                    value={newTransaction.note}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        note: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="amounts-section">
                  <div className="amounts-grid">
                    <div className="amount-group">
                      <label>
                        <TrendingDown size={16} />
                        Débit (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={newTransaction.debit}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            debit: e.target.value,
                            credit: e.target.value ? "" : newTransaction.credit,
                          })
                        }
                      />
                    </div>

                    <div className="amount-group">
                      <label>
                        <TrendingUp size={16} />
                        Crédit (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={newTransaction.credit}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            credit: e.target.value,
                            debit: e.target.value ? "" : newTransaction.debit,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="balance-preview">
                    <div className="balance-label">Impact sur le solde:</div>
                    <div
                      className={`balance-value ${getBalanceColorClass(
                        currentBalance
                      )}`}
                    >
                      {currentBalance >= 0 ? "+" : ""}
                      {currentBalance.toFixed(2)} €
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary full-width">
                  <Plus size={16} />
                  Ajouter l'opération
                </button>
              </div>
            </form>
          </div>

          {/* FAVORIS RAPIDES */}
          {favoriteTransactionsList.length > 0 && (
            <div className="card favorites-card">
              <div className="card-header">
                <h2>
                  <Star size={18} />
                  Favoris Rapides
                </h2>
              </div>
              <div className="favorites-list">
                {favoriteTransactionsList.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="favorite-item">
                    <div className="favorite-info">
                      <div className="favorite-libelle">{tx.libelle}</div>
                      <div className="favorite-amounts">
                        {tx.debit > 0 && (
                          <span className="negative">
                            -{tx.debit.toFixed(2)}€
                          </span>
                        )}
                        {tx.credit > 0 && (
                          <span className="positive">
                            +{tx.credit.toFixed(2)}€
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn-icon duplicate-btn"
                      onClick={() => duplicateFromFavorite(tx)}
                      title="Dupliquer cette transaction"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE - TABLEAU ET FILTRES */}
        <div className="right-column">
          {/* FILTRES AVANCÉS */}
          <div className="card filters-card">
            <div className="filters-grid">
              <div className="search-group">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un libellé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Toutes les opérations</option>
                  <option value="debit">Débits uniquement</option>
                  <option value="credit">Crédits uniquement</option>
                  <option value="favorites">Favoris uniquement</option>
                </select>
              </div>

              <div className="date-range-group">
                <input
                  type="date"
                  placeholder="Début"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
                <span>à</span>
                <input
                  type="date"
                  placeholder="Fin"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>

              <button
                className="btn btn-secondary reset-btn"
                onClick={resetFilters}
              >
                <RefreshCw size={16} />
                Réinitialiser
              </button>
            </div>
          </div>

          {/* TABLEAU DES TRANSACTIONS */}
          <div className="card transactions-card">
            <div className="card-header">
              <h2>
                <FileText size={18} />
                Historique des Opérations ({filteredTransactions.length})
              </h2>
            </div>

            <div className="table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Libellé</th>
                    <th>Débit (€)</th>
                    <th>Crédit (€)</th>
                    <th>Solde (€)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        <div className="no-data-content">
                          <FileText size={32} />
                          <p>Aucune opération trouvée</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        className={getRowClass(transaction, index)}
                      >
                        {/* DATE */}
                        <td className="date-cell">
                          {editingDate.id === transaction.id ? (
                            <div className="edit-container">
                              <input
                                type="date"
                                value={editingDate.value}
                                onChange={(e) =>
                                  setEditingDate({
                                    ...editingDate,
                                    value: e.target.value,
                                  })
                                }
                                className="edit-input"
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button
                                  onClick={() => saveDateEdit(transaction.id)}
                                  className="btn-icon save"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={cancelDateEdit}
                                  className="btn-icon cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="date-content"
                              onClick={() =>
                                startDateEdit(transaction.id, transaction.date)
                              }
                            >
                              <Calendar size={14} />
                              {formatDate(transaction.date)}
                            </div>
                          )}
                        </td>

                        {/* LIBELLÉ */}
                        <td className="libelle-cell">
                          {editingId === transaction.id ? (
                            <div className="edit-container">
                              <input
                                type="text"
                                value={editLibelle}
                                onChange={(e) => setEditLibelle(e.target.value)}
                                className="edit-input"
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button
                                  onClick={() => saveEdit(transaction.id)}
                                  className="btn-icon save"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="btn-icon cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="libelle-content">
                              <div
                                className="libelle-text"
                                onClick={() =>
                                  startEdit(transaction.id, transaction.libelle)
                                }
                              >
                                {transaction.libelle}
                              </div>
                              {transaction.note && (
                                <div className="note-badge">
                                  {transaction.note}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* DÉBIT */}
                        <td className="amount-cell debit-cell">
                          {editingAmount.id === transaction.id &&
                          editingAmount.field === "debit" ? (
                            <div className="edit-container">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingAmount.value}
                                onChange={(e) =>
                                  setEditingAmount({
                                    ...editingAmount,
                                    value: e.target.value,
                                  })
                                }
                                className="edit-input"
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button
                                  onClick={() =>
                                    saveAmountEdit(transaction.id, "debit")
                                  }
                                  className="btn-icon save"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={cancelAmountEdit}
                                  className="btn-icon cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="amount-content"
                              onClick={() =>
                                startAmountEdit(
                                  transaction.id,
                                  "debit",
                                  transaction.debit
                                )
                              }
                            >
                              {transaction.debit > 0 && (
                                <span className="negative">
                                  -{transaction.debit.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* CRÉDIT */}
                        <td className="amount-cell credit-cell">
                          {editingAmount.id === transaction.id &&
                          editingAmount.field === "credit" ? (
                            <div className="edit-container">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingAmount.value}
                                onChange={(e) =>
                                  setEditingAmount({
                                    ...editingAmount,
                                    value: e.target.value,
                                  })
                                }
                                className="edit-input"
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button
                                  onClick={() =>
                                    saveAmountEdit(transaction.id, "credit")
                                  }
                                  className="btn-icon save"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={cancelAmountEdit}
                                  className="btn-icon cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="amount-content"
                              onClick={() =>
                                startAmountEdit(
                                  transaction.id,
                                  "credit",
                                  transaction.credit
                                )
                              }
                            >
                              {transaction.credit > 0 && (
                                <span className="positive">
                                  +{transaction.credit.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* SOLDE */}
                        <td className="balance-cell">
                          <div
                            className={`balance-value ${getBalanceColorClass(
                              transaction.solde
                            )}`}
                          >
                            {showBalance
                              ? `${transaction.solde.toFixed(2)}`
                              : "••••••"}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="actions-cell">
                          <div className="actions-group">
                            <button
                              onClick={() => toggleFavorite(transaction.id)}
                              className={`btn-icon favorite-btn ${
                                favoriteTransactions.includes(transaction.id)
                                  ? "active"
                                  : ""
                              }`}
                              title="Ajouter aux favoris"
                            >
                              <Star
                                size={14}
                                fill={
                                  favoriteTransactions.includes(transaction.id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                            <button
                              onClick={() => duplicateTransaction(transaction)}
                              className="btn-icon duplicate-btn"
                              title="Dupliquer"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTransaction(transaction.id)
                              }
                              className="btn-icon delete-btn"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="totals-row">
                    <td colSpan="2">Totaux</td>
                    <td className="negative">-{totals.debit.toFixed(2)} €</td>
                    <td className="positive">+{totals.credit.toFixed(2)} €</td>
                    <td
                      className={`final-balance ${getBalanceColorClass(
                        totals.finalBalance
                      )}`}
                    >
                      {showBalance
                        ? `${totals.finalBalance.toFixed(2)} €`
                        : "••••••"}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE STATISTIQUES MENSUELLES */}
      {showMonthlyModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowMonthlyModal(false)}
        >
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <BarChart3 size={20} />
                Statistiques Mensuelles
              </h2>
              <button
                className="btn-icon"
                onClick={() => setShowMonthlyModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="month-selector">
                <label>Sélectionnez un mois :</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {new Date(month + "-01").toLocaleDateString("fr-FR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="monthly-stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{selectedMonthStats.count}</div>
                  <div className="stat-label">Opérations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value negative">
                    -{selectedMonthStats.debit.toFixed(2)} €
                  </div>
                  <div className="stat-label">Dépenses</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value positive">
                    +{selectedMonthStats.credit.toFixed(2)} €
                  </div>
                  <div className="stat-label">Revenus</div>
                </div>
                <div className="stat-card">
                  <div
                    className={`stat-value ${
                      selectedMonthStats.credit - selectedMonthStats.debit >= 0
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {selectedMonthStats.credit - selectedMonthStats.debit >= 0
                      ? "+"
                      : ""}
                    {(
                      selectedMonthStats.credit - selectedMonthStats.debit
                    ).toFixed(2)}{" "}
                    €
                  </div>
                  <div className="stat-label">Solde du mois</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {selectedMonthStats.startBalance.toFixed(2)} €
                  </div>
                  <div className="stat-label">Solde début</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {selectedMonthStats.endBalance.toFixed(2)} €
                  </div>
                  <div className="stat-label">Solde fin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE ANALYTIQUES AVANCÉES */}
      {showAnalyticsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAnalyticsModal(false)}
        >
          <div
            className="modal-content xlarge"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <LineChart size={20} />
                Analytics Avancées
              </h2>
              <div className="period-selector">
                <select
                  value={analyticsPeriod}
                  onChange={(e) => setAnalyticsPeriod(e.target.value)}
                >
                  <option value="1month">1 mois</option>
                  <option value="3months">3 mois</option>
                  <option value="6months">6 mois</option>
                  <option value="1year">1 an</option>
                </select>
              </div>
              <button
                className="btn-icon"
                onClick={() => setShowAnalyticsModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="analytics-grid">
                <div className="analytics-card large">
                  <h3>Évolution des Flux</h3>
                  <div className="chart-container">
                    <div className="chart-bars">
                      {chartData.map((month, index) => (
                        <div key={index} className="chart-bar-group">
                          <div className="chart-bar-labels">
                            <span>{month.month}</span>
                          </div>
                          <div className="chart-bars-container">
                            <div
                              className="chart-bar debit-bar"
                              style={{
                                height: `${(month.debit / maxValue) * 80}%`,
                              }}
                              title={`Dépenses: ${month.debit.toFixed(2)}€`}
                            ></div>
                            <div
                              className="chart-bar credit-bar"
                              style={{
                                height: `${(month.credit / maxValue) * 80}%`,
                              }}
                              title={`Revenus: ${month.credit.toFixed(2)}€`}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Performance Financière</h3>
                  <div className="performance-stats">
                    <div className="performance-item">
                      <div className="performance-label">Dépenses totales</div>
                      <div className="performance-value negative">
                        {detailedStats.totalDebit.toFixed(2)} €
                      </div>
                      <div
                        className={`performance-trend ${
                          detailedStats.debitTrend <= 0
                            ? "positive"
                            : "negative"
                        }`}
                      >
                        {detailedStats.debitTrend > 0 ? "+" : ""}
                        {detailedStats.debitTrend.toFixed(1)}%
                      </div>
                    </div>
                    <div className="performance-item">
                      <div className="performance-label">Revenus totaux</div>
                      <div className="performance-value positive">
                        {detailedStats.totalCredit.toFixed(2)} €
                      </div>
                      <div
                        className={`performance-trend ${
                          detailedStats.creditTrend >= 0
                            ? "positive"
                            : "negative"
                        }`}
                      >
                        {detailedStats.creditTrend > 0 ? "+" : ""}
                        {detailedStats.creditTrend.toFixed(1)}%
                      </div>
                    </div>
                    <div className="performance-item">
                      <div className="performance-label">Solde net</div>
                      <div
                        className={`performance-value ${
                          detailedStats.net >= 0 ? "positive" : "negative"
                        }`}
                      >
                        {detailedStats.net >= 0 ? "+" : ""}
                        {detailedStats.net.toFixed(2)} €
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Statistiques Avancées</h3>
                  <div className="advanced-stats">
                    <div className="stat-row">
                      <span>Nombre d'opérations</span>
                      <span>{detailedStats.transactionCount}</span>
                    </div>
                    <div className="stat-row">
                      <span>Débits moyens</span>
                      <span>{detailedStats.avgDebit.toFixed(2)} €</span>
                    </div>
                    <div className="stat-row">
                      <span>Crédits moyens</span>
                      <span>{detailedStats.avgCredit.toFixed(2)} €</span>
                    </div>
                    <div className="stat-row">
                      <span>Plus gros débit</span>
                      <span className="negative">
                        -{detailedStats.largestDebit.toFixed(2)} €
                      </span>
                    </div>
                    <div className="stat-row">
                      <span>Plus gros crédit</span>
                      <span className="positive">
                        +{detailedStats.largestCredit.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE SUIVI BUDGET */}
      {showBudgetModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowBudgetModal(false)}
        >
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <Target size={20} />
                Suivi Budget & Alertes
              </h2>
              <button
                className="btn-icon"
                onClick={() => setShowBudgetModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {/* CONFIGURATION BUDGET */}
              <div className="budget-config">
                <h3>Objectifs Budgetaires</h3>
                <div className="budget-inputs">
                  <div className="form-group">
                    <label>Budget mensuel dépenses (€)</label>
                    <input
                      type="number"
                      step="50"
                      value={budgetTargets.monthlySpending}
                      onChange={(e) =>
                        setBudgetTargets({
                          ...budgetTargets,
                          monthlySpending: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Taux d'épargne cible (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={budgetTargets.savingsRate}
                      onChange={(e) =>
                        setBudgetTargets({
                          ...budgetTargets,
                          savingsRate: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Seuil d'alerte budget (%)</label>
                    <input
                      type="number"
                      step="5"
                      min="50"
                      max="100"
                      value={budgetTargets.alertThreshold}
                      onChange={(e) =>
                        setBudgetTargets({
                          ...budgetTargets,
                          alertThreshold: parseInt(e.target.value) || 80,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* PROGRESSION BUDGET */}
              <div className="budget-progress">
                <h3>Progression du Mois</h3>
                <div className="progress-bar-container">
                  <div className="progress-labels">
                    <span>0€</span>
                    <span>{budgetTargets.monthlySpending.toFixed(0)}€</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${
                        budgetAnalysis.budgetProgress >= 100
                          ? "exceeded"
                          : budgetAnalysis.budgetProgress >=
                            budgetTargets.alertThreshold
                          ? "warning"
                          : "normal"
                      }`}
                      style={{
                        width: `${Math.min(
                          budgetAnalysis.budgetProgress,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="progress-value">
                    {budgetAnalysis.monthlyDebit.toFixed(2)}€ /{" "}
                    {budgetTargets.monthlySpending.toFixed(0)}€ (
                    {Math.min(budgetAnalysis.budgetProgress, 100).toFixed(1)}%)
                  </div>
                </div>
              </div>

              {/* ALERTES */}
              {budgetAnalysis.alerts.length > 0 && (
                <div className="budget-alerts">
                  <h3>Alertes Budget</h3>
                  <div className="alerts-list">
                    {budgetAnalysis.alerts.map((alert, index) => (
                      <div key={index} className={`alert-item ${alert.type}`}>
                        <div className="alert-icon">{alert.icon}</div>
                        <div className="alert-content">
                          <div className="alert-title">{alert.title}</div>
                          <div className="alert-message">{alert.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROJECTIONS */}
              <div className="budget-projections">
                <h3>Projections d'Épargne</h3>
                <div className="projections-grid">
                  {budgetAnalysis.projections.map((projection, index) => (
                    <div key={index} className="projection-card">
                      <div className="projection-period">
                        {projection.period}
                      </div>
                      <div className="projection-amount">
                        {projection.amount.toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
