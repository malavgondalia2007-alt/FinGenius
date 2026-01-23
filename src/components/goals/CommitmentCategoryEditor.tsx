import React from 'react';
import { CommitmentCategory } from '../../types';
import {
  Home,
  Utensils,
  Car,
  GraduationCap,
  CreditCard,
  Zap,
  Smartphone,
  Film,
  Heart,
  MoreHorizontal,
  EyeOff,
  AlertCircle,
  Plus } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface CommitmentCategoryEditorProps {
  categories: CommitmentCategory[];
  onChange: (categories: CommitmentCategory[]) => void;
  monthlyIncome: number;
}
const iconMap: Record<string, any> = {
  Home,
  Utensils,
  Car,
  GraduationCap,
  CreditCard,
  Zap,
  Smartphone,
  Film,
  Heart,
  MoreHorizontal
};
export function CommitmentCategoryEditor({
  categories,
  onChange,
  monthlyIncome
}: CommitmentCategoryEditorProps) {
  const handleAmountChange = (id: string, amount: string) => {
    const numAmount = parseInt(amount) || 0;
    const newCategories = categories.map((c) =>
    c.id === id ?
    {
      ...c,
      amount: numAmount
    } :
    c
    );
    onChange(newCategories);
  };
  const toggleHidden = (id: string) => {
    const newCategories = categories.map((c) =>
    c.id === id ?
    {
      ...c,
      hidden: !c.hidden
    } :
    c
    );
    onChange(newCategories);
  };
  const getStatusColor = (category: CommitmentCategory) => {
    if (category.hidden) return 'text-gray-400';
    if (category.amount > category.recommendedMax) return 'text-red-500';
    if (category.amount > category.recommendedMin) return 'text-amber-500';
    return 'text-emerald-500';
  };
  const getStatusBorder = (category: CommitmentCategory) => {
    if (category.hidden) return 'border-gray-200 bg-gray-50';
    if (category.amount > category.recommendedMax)
    return 'border-red-200 bg-red-50';
    if (category.amount > category.recommendedMin)
    return 'border-amber-200 bg-amber-50';
    return 'border-emerald-200 bg-emerald-50';
  };
  const totalCommitments = categories.
  filter((c) => !c.hidden).
  reduce((sum, c) => sum + c.amount, 0);
  const remaining = monthlyIncome - totalCommitments;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || MoreHorizontal;
            const isHigh = category.amount > category.recommendedMax;
            if (category.hidden) return null;
            return (
              <motion.div
                key={category.id}
                initial={{
                  opacity: 0,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95
                }}
                className={`p-4 rounded-xl border-2 transition-colors ${getStatusBorder(category)}`}>

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-white ${getStatusColor(category)}`}>

                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {category.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Rec: ₹{category.recommendedMin.toLocaleString()} - ₹
                        {category.recommendedMax.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleHidden(category.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Hide category">

                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={category.amount || ''}
                    onChange={(e) =>
                    handleAmountChange(category.id, e.target.value)
                    }
                    className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0" />

                </div>

                {isHigh &&
                <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Above recommended range</span>
                  </div>
                }
              </motion.div>);

          })}
        </AnimatePresence>

        {/* Add hidden categories back */}
        <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2 mt-4">
          {categories.
          filter((c) => c.hidden).
          map((category) =>
          <button
            key={category.id}
            onClick={() => toggleHidden(category.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm">

                <Plus className="w-3 h-3" />
                Add {category.name}
              </button>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Commitments</p>
            <p className="text-xl font-bold text-gray-900">
              ₹{totalCommitments.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Remaining Capacity</p>
            <p
              className={`text-xl font-bold ${remaining > 0 ? 'text-emerald-600' : 'text-red-600'}`}>

              ₹{remaining.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${remaining > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{
              width: `${Math.min(totalCommitments / monthlyIncome * 100, 100)}%`
            }} />

        </div>
      </div>
    </div>);

}